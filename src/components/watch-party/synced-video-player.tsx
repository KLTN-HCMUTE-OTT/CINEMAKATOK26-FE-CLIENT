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
import type { VideoState } from "@/types/watch-party";

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
  onSync: (state: { isPlaying: boolean; currentTime: number }) => void;
  onVideoEnd: (videoId: string) => void;
}

export function SyncedVideoPlayer({
  videoState,
  awaitingHost,
  isHost,
  onSync,
  onVideoEnd,
}: SyncedVideoPlayerProps) {
  // ── Refs ────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef(0);
  const lastVideoIdRef = useRef<string | null>(null);
  const videoEndSentRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Sync helpers ─────────────────────────────────────────────────────────
  const throttledSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      const now = Date.now();
      if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return;
      lastSyncRef.current = now;
      onSync(state);
    },
    [onSync]
  );

  // Apply server state → local player (non-host only)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState || isHost) return;

    if (videoState.videoId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = videoState.videoId;
      videoEndSentRef.current = null;
    }

    const expectedTime =
      videoState.isPlaying && videoState.startedAt
        ? videoState.currentTime + (Date.now() / 1000 - videoState.lastUpdatedAt)
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
  }, [videoState, isHost]);

  // Host: broadcast events on play/pause/seek/timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isHost) return;

    const onPlay = () =>
      throttledSync({ isPlaying: true, currentTime: video.currentTime });
    const onPause = () =>
      throttledSync({ isPlaying: false, currentTime: video.currentTime });
    const onSeeked = () =>
      throttledSync({ isPlaying: !video.paused, currentTime: video.currentTime });
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
  }, [isHost, videoState?.videoId, throttledSync, onVideoEnd]);

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
    if (!isHost) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [isHost]);

  const handleSkip = useCallback(
    (seconds: number) => {
      if (!isHost) return;
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(
        0,
        Math.min(video.currentTime + seconds, video.duration)
      );
    },
    [isHost]
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
      if (!isHost) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsProgressDragging(true);
      setDragTime(getProgressTime(e));
    },
    [isHost, getProgressTime]
  );

  const handleProgressPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isHost || !isProgressDragging) return;
      setDragTime(getProgressTime(e));
    },
    [isHost, isProgressDragging, getProgressTime]
  );

  const handleProgressPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isHost) return;
      setIsProgressDragging(false);
      const time = getProgressTime(e);
      setDragTime(null);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    [isHost, getProgressTime]
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

  // ── Waiting state ───────────────────────────────────────────────────────
  if (awaitingHost) {
    return (
      <div className="w-full h-full bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-500 animate-pulse" />
          </div>
          {isHost ? (
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
    );
  }

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
      <video
        ref={videoRef}
        key={videoState?.videoId}
        className="w-full h-full object-contain"
        playsInline
      />

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
              isHost
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
              {isHost && (
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
                  isHost
                    ? isPlaying
                      ? "Pause (Space)"
                      : "Play (Space)"
                    : "Host controls playback"
                }
                className={`p-1.5 transition-colors ${
                  isHost
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

              {/* Skip –10 / +10 (host only) */}
              {isHost && (
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

              {/* Guest lock badge */}
              {!isHost && (
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
