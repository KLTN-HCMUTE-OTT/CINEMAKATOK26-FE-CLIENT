"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Lock,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  Rewind,
} from "lucide-react";
import Link from "next/link";
import { Lock as LockIcon, LogIn } from "lucide-react";
import type { VideoState } from "@/types/watch-party";
import useVideoAccess from "@/hooks/use-video-access";
import { getAccessTokenInMemory } from "@/lib/request";
import { env } from "@/env";
import { useUIStore } from "@/store";
import {
  isUnauthenticatedError,
  isPermissionError,
  getFriendlyErrorMessage,
} from "@/lib/error-mapper";

const SYNC_THROTTLE_MS = 500;
const DRIFT_TOLERANCE_SEC = 1.5;
const CONTROLS_HIDE_DELAY = 3000;

function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface SyncedVideoPlayerProps {
  videoState: VideoState | null;
  awaitingHost: boolean;
  isHost: boolean;
  isAdmin?: boolean;
  onSync: (state: { isPlaying: boolean; currentTime: number }) => void;
  onVideoEnd: (videoId: string) => void;
}

export function SyncedVideoPlayer({
  videoState,
  awaitingHost,
  isHost,
  isAdmin = false,
  onSync,
  onVideoEnd,
}: SyncedVideoPlayerProps) {
  const canControl = isHost || isAdmin;

  // ── Refs ────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef(0);
  const lastVideoIdRef = useRef<string | null>(null);
  const videoEndSentRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shakaPlayerRef = useRef<any>(null);
  const destroyPromiseRef = useRef<Promise<void> | null>(null);

  // ── UI state ────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [isProgressDragging, setIsProgressDragging] = useState(false);

  // ── Secure source: signed manifest + DRM key (gated per participant) ──────
  const {
    videoContent,
    isLoading: isAccessLoading,
    error: accessError,
  } = useVideoAccess(
    videoState?.videoId ? { videoId: videoState.videoId } : { videoId: "" }
  );
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  // ── Load the signed manifest via Shaka + ClearKey DRM ────────────────────
  // Mirrors the Movie page secure flow (useVideoPlayer `isDash` branch): Shaka
  // attaches to the same <video> element, so the sync effects below keep working.
  useEffect(() => {
    const video = videoRef.current;
    const manifestUrl = videoContent?.src;
    if (!video || !manifestUrl) return;

    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let shakaPlayer: any = null;
    const licenseVideoId = videoState?.videoId || "";

    const initPlayer = async () => {
      // Await any teardown started by a previous run before re-attaching.
      if (destroyPromiseRef.current) {
        try {
          await destroyPromiseRef.current;
        } catch {
          /* ignore */
        }
        destroyPromiseRef.current = null;
      }
      if (shakaPlayerRef.current) {
        try {
          await shakaPlayerRef.current.destroy();
        } catch {
          /* ignore */
        }
        shakaPlayerRef.current = null;
      }

      try {
        const shaka = (
          await import("shaka-player/dist/shaka-player.compiled")
        ).default;
        if (!active) return;

        shaka.polyfill.installAll();
        if (!shaka.Player.isBrowserSupported()) {
          throw new Error("Browser not supported by Shaka Player");
        }

        const player = new shaka.Player();
        await player.attach(video);
        if (!active) {
          player.destroy();
          return;
        }
        shakaPlayerRef.current = player;
        shakaPlayer = player;

        // Configure ClearKey DRM against the secure license endpoint.
        const apiBaseUrl = env.NEXT_PUBLIC_API_URL;
        const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
        player.configure({
          drm: {
            servers: {
              "org.w3.clearkey": `${baseUrl}api/v1/drm/license/clearkey`,
            },
          },
        });

        // Attach JWT bearer + videoId to the license request (per-participant gating).
        player
          .getNetworkingEngine()!
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .registerRequestFilter((requestType: any, request: any) => {
            if (requestType === shaka.net.NetworkingEngine.RequestType.LICENSE) {
              const token = getAccessTokenInMemory();
              if (token) {
                request.headers["Authorization"] = `Bearer ${token}`;
              }
              request.headers["Content-Type"] = "application/json";
              if (request.body) {
                try {
                  const body = JSON.parse(
                    new TextDecoder().decode(request.body)
                  );
                  body.videoId = licenseVideoId;
                  request.body = new TextEncoder().encode(JSON.stringify(body));
                } catch (e) {
                  console.error("Failed to parse license request body", e);
                }
              }
            }
          });

        await player.load(manifestUrl);
      } catch (err) {
        if (active) {
          console.error("[SyncedVideoPlayer] Shaka init failed:", err);
        }
      }
    };

    initPlayer();

    return () => {
      active = false;
      if (shakaPlayer) {
        destroyPromiseRef.current = shakaPlayer.destroy();
      } else if (shakaPlayerRef.current) {
        destroyPromiseRef.current = shakaPlayerRef.current.destroy();
        shakaPlayerRef.current = null;
      }
    };
  }, [videoContent?.src, videoContent?.drmKeyId, videoState?.videoId]);

  // ── Reset to a clean paused state on video change ────────────────────────
  // A switched-in video should start stopped with a "Play" control; the sync
  // effect (viewers) or the host then drives playback from there.
  useEffect(() => {
    const video = videoRef.current;
    if (video && !video.paused) video.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
  }, [videoState?.videoId]);

  // ── Sync helpers ─────────────────────────────────────────────────────────
  // Critical state changes (play/pause/seek) must always propagate — never let
  // them be swallowed by the throttle that exists to tame `timeupdate` spam.
  const emitSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      lastSyncRef.current = Date.now();
      onSync(state);
    },
    [onSync]
  );

  const throttledSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      const now = Date.now();
      if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return;
      lastSyncRef.current = now;
      onSync(state);
    },
    [onSync]
  );

  // Apply server state → local player (everyone tracks server state; canControl users also emit)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState) return;

    if (videoState.videoId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = videoState.videoId;
      videoEndSentRef.current = null;
    }

    // Server timestamps (lastUpdatedAt / startedAt) are in milliseconds, so the
    // elapsed time since the host's last update must be computed in ms then
    // converted to seconds — mixing s and ms here corrupts the projected time.
    const expectedTime =
      videoState.isPlaying && videoState.startedAt
        ? videoState.currentTime +
          (Date.now() - videoState.lastUpdatedAt) / 1000
        : videoState.currentTime;

    const drift = Math.abs(video.currentTime - expectedTime);
    if (drift > DRIFT_TOLERANCE_SEC) {
      video.currentTime = expectedTime;
    }

    if (videoState.isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!videoState.isPlaying && !video.paused) {
      video.pause();
    }
  }, [videoState]);

  // Host/admin: broadcast events on play/pause/seek/timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canControl) return;

    const onPlay = () =>
      emitSync({ isPlaying: true, currentTime: video.currentTime });
    const onPause = () =>
      emitSync({ isPlaying: false, currentTime: video.currentTime });
    const onSeeked = () =>
      emitSync({ isPlaying: !video.paused, currentTime: video.currentTime });
    const onEnded = () => {
      const vid = videoState?.videoId;
      if (vid && videoEndSentRef.current !== vid) {
        videoEndSentRef.current = vid;
        onVideoEnd(vid);
      }
    };
    const onTimeUpdate = () => {
      if (!video.paused) {
        throttledSync({ isPlaying: true, currentTime: video.currentTime });
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [canControl, videoState?.videoId, emitSync, throttledSync, onVideoEnd]);

  // Drive UI state from video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        setBuffered(
          (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
        );
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("progress", onProgress);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("progress", onProgress);
    };
  }, []);

  // Fullscreen change detection
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Controls auto-hide ──────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(
      () => setShowControls(false),
      CONTROLS_HIDE_DELAY
    );
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetHideTimer]);

  // ── Control handlers ────────────────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    if (!canControl) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [canControl]);

  const handleSkip = useCallback(
    (seconds: number) => {
      if (!canControl) return;
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(
        0,
        Math.min(video.currentTime + seconds, video.duration)
      );
    },
    [canControl]
  );

  const getProgressTime = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      if (!bar || !duration) return 0;
      const rect = bar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(pos * duration, duration));
    },
    [duration]
  );

  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canControl) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsProgressDragging(true);
      setDragTime(getProgressTime(e));
    },
    [canControl, getProgressTime]
  );

  const handleProgressPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canControl || !isProgressDragging) return;
      setDragTime(getProgressTime(e));
    },
    [canControl, isProgressDragging, getProgressTime]
  );

  const handleProgressPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canControl) return;
      setIsProgressDragging(false);
      const time = getProgressTime(e);
      setDragTime(null);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    [canControl, getProgressTime]
  );

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = volumeBarRef.current;
      const video = videoRef.current;
      if (!bar || !video) return;
      const rect = bar.getBoundingClientRect();
      const vol = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
      video.volume = vol;
      if (vol > 0) video.muted = false;
    },
    []
  );

  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  // Play/pause/seek go through the same canControl-gated handlers (viewers can't
  // drive playback); volume/mute/fullscreen are local and allowed for everyone.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      // Don't hijack typing in the chat box / other inputs.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          handleTogglePlay();
          break;
        case "ArrowLeft":
          if (!canControl) return;
          e.preventDefault();
          handleSkip(-10);
          break;
        case "ArrowRight":
          if (!canControl) return;
          e.preventDefault();
          handleSkip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          video.muted = false;
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "m":
        case "M":
          handleToggleMute();
          break;
        case "f":
        case "F":
          handleToggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    canControl,
    handleTogglePlay,
    handleSkip,
    handleToggleMute,
    handleToggleFullscreen,
  ]);

  // ── Derived values ──────────────────────────────────────────────────────
  const displayTime = dragTime ?? currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black"
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
    >
      {/*
        No `key` here: the element must stay stable across video switches.
        Shaka detaches/reattaches and loads the new manifest on the same
        element, and the once-attached UI event listeners keep firing — a
        `key` would recreate the element and orphan those listeners (frozen UI).
      */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* ── Awaiting-host overlay (kept above the always-mounted <video>) ──── */}
      {awaitingHost && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-500 animate-pulse" />
            </div>
            {canControl ? (
              <div className="space-y-2">
                <p className="text-white font-semibold">Queue is empty</p>
                <p className="text-gray-400 text-sm">
                  Select a video to continue the party
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-white font-semibold">Waiting for host…</p>
                <p className="text-gray-400 text-sm">
                  The host is choosing the next video
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Access gating overlays (per participant) ──────────────────────── */}
      {isAccessLoading ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
          <div className="flex items-center gap-2 text-white text-lg">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Loading secure player…
          </div>
        </div>
      ) : accessError && isUnauthenticatedError(accessError) ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-semibold text-lg">Sign in to watch</p>
            <p className="text-gray-300 text-sm max-w-sm">
              {getFriendlyErrorMessage(accessError)}
            </p>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : accessError && isPermissionError(accessError) ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <LockIcon className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-semibold text-lg">
              Subscription required
            </p>
            <p className="text-gray-300 text-sm max-w-sm">
              {getFriendlyErrorMessage(accessError)}
            </p>
          </div>
          <Link
            href="/#pricing"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-full transition-colors"
          >
            View plans
          </Link>
        </div>
      ) : null}

      {/* Control overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-8 space-y-1.5">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className={`relative w-full h-1.5 bg-white/30 rounded-full group/progress transition-all duration-150 ${
              canControl
                ? "cursor-pointer hover:h-2.5"
                : "cursor-default"
            } ${isProgressDragging ? "h-2.5" : ""}`}
            onPointerDown={handleProgressPointerDown}
            onPointerMove={handleProgressPointerMove}
            onPointerUp={handleProgressPointerUp}
            onPointerCancel={handleProgressPointerUp}
          >
            {/* Buffered track */}
            <div
              className="absolute h-full bg-white/40 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Played track */}
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              {canControl && (
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-opacity ${
                    isProgressDragging
                      ? "opacity-100"
                      : "opacity-0 group-hover/progress:opacity-100"
                  }`}
                />
              )}
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between gap-2">
            {/* ── Left controls ── */}
            <div className="flex items-center gap-0.5">
              {/* Play / Pause */}
              <button
                onClick={handleTogglePlay}
                title={
                  canControl
                    ? isPlaying
                      ? "Pause (Space)"
                      : "Play (Space)"
                    : "Host controls playback"
                }
                className={`p-1.5 transition-colors ${
                  canControl
                    ? "text-white hover:text-purple-400"
                    : "text-white/40 cursor-not-allowed"
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5" fill="currentColor" />
                )}
              </button>

              {/* Skip –10 / +10 (host/admin only) */}
              {canControl && (
                <>
                  <button
                    onClick={() => handleSkip(-10)}
                    title="Rewind 10s"
                    className="hidden md:block p-1.5 text-white hover:text-purple-400 transition-colors"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSkip(10)}
                    title="Forward 10s"
                    className="hidden md:block p-1.5 text-white hover:text-purple-400 transition-colors"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Volume */}
              <div className="flex items-center group/vol">
                <button
                  onClick={handleToggleMute}
                  title={isMuted ? "Unmute (M)" : "Mute (M)"}
                  className="p-1.5 text-white hover:text-purple-400 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div
                  ref={volumeBarRef}
                  className="hidden md:block w-0 group-hover/vol:w-16 overflow-hidden transition-all duration-300 cursor-pointer"
                  onClick={handleVolumeClick}
                >
                  <div className="h-1 bg-white/30 rounded-full mx-1">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-xs font-medium tabular-nums ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Viewer lock badge */}
              {!canControl && (
                <div className="flex items-center gap-1 text-gray-400 text-[11px] ml-2">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Host controls playback</span>
                </div>
              )}
            </div>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-0.5">
              {/* Fullscreen */}
              <button
                onClick={handleToggleFullscreen}
                title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
                className="p-1.5 text-white hover:text-purple-400 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
