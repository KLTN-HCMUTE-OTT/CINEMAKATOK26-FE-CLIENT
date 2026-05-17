"use client";

import { useRef, useEffect, useCallback } from "react";
import { Lock, Clock } from "lucide-react";
import type { VideoState } from "@/types/watch-party";

const SYNC_THROTTLE_MS = 500;
const DRIFT_TOLERANCE_SEC = 1.5;

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSyncRef = useRef(0);
  const lastVideoIdRef = useRef<string | null>(null);
  const videoEndSentRef = useRef<string | null>(null);

  const throttledSync = useCallback(
    (state: { isPlaying: boolean; currentTime: number }) => {
      const now = Date.now();
      if (now - lastSyncRef.current < SYNC_THROTTLE_MS) return;
      lastSyncRef.current = now;
      onSync(state);
    },
    [onSync]
  );

  // Apply server state to local player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState || isHost) return;

    // videoId changed → need to change src
    if (videoState.videoId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = videoState.videoId;
      videoEndSentRef.current = null;
      // In a real implementation, set video src here based on videoId
      // For now, we update currentTime based on server state
    }

    const expectedTime =
      videoState.isPlaying && videoState.startedAt
        ? videoState.currentTime +
          (Date.now() / 1000 - videoState.lastUpdatedAt)
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

  // Host: register player events
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
              <p className="text-gray-400 text-sm">Select a video to continue the party</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-white font-semibold">Waiting for host…</p>
              <p className="text-gray-400 text-sm">The host is choosing the next video</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        key={videoState?.videoId}
        className="w-full h-full object-contain"
        controls={isHost}
        playsInline
      />

      {/* Non-host seek lock overlay */}
      {!isHost && (
        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end pointer-events-none">
          <div className="w-full px-4 pb-3 flex items-center gap-2 text-[11px] text-gray-500">
            <Lock className="w-3 h-3" />
            Host controls playback
          </div>
        </div>
      )}
    </div>
  );
}
