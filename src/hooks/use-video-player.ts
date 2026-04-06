/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useEffect } from "react";
import type Player from "video.js/dist/types/player";
import videojs from "video.js";
import "@videojs/http-streaming";
import "videojs-hls-quality-selector";
import "video.js/dist/video-js.css";

export interface VideoInfo {
  videoSrc: string;
  videoMimeType: string;
}

export interface UseVideoPlayerProps extends VideoInfo {}

export const useVideoPlayer = ({
  videoSrc,
  videoMimeType,
}: UseVideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        preload: "auto",
        controlBar: {
          //  Cấu hình đầy đủ control bar
          playToggle: true,
          volumePanel: {
            inline: false,
          },
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          progressControl: true,
          liveDisplay: false,
          seekToLive: false,
          remainingTimeDisplay: false,
          customControlSpacer: true,
          playbackRateMenuButton: true, //  Tốc độ phát
          chaptersButton: false,
          descriptionsButton: false,
          subsCapsButton: false,
          audioTrackButton: false,
          pictureInPictureToggle: true, //  Picture-in-Picture
          fullscreenToggle: true, //  Fullscreen button
        },
        html5: {
          vhs: {
            withCredentials: true,
            overrideNative: true,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        fluid: false,
        fill: true,
        sources: [
          {
            src: videoSrc,
            type: videoMimeType,
          },
        ],
      });

      playerRef.current = player;

      player.ready(() => {
        console.log("Player is ready");

        //  Force hiện controls
        player.controls(true);

        //  Thêm keyboard shortcuts
        player.on("keydown", (e: KeyboardEvent) => {
          // Space: play/pause
          if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            if (player.paused()) {
              player.play();
            } else {
              player.pause();
            }
          }
          // Arrow Right: +10s
          if (e.key === "ArrowRight") {
            e.preventDefault();
            if (player) {
              player.currentTime(player.currentTime() + 10);
            }
          }
          // Arrow Left: -10s
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            player.currentTime(player.currentTime() - 10);
          }
          // Arrow Up: +10% volume
          if (e.key === "ArrowUp") {
            e.preventDefault();
            player.volume(Math.min(player.volume() + 0.1, 1));
          }
          // Arrow Down: -10% volume
          if (e.key === "ArrowDown") {
            e.preventDefault();
            player.volume(Math.max(player.volume() - 0.1, 0));
          }
          // F: fullscreen
          if (e.key === "f" || e.key === "F") {
            e.preventDefault();
            if (player.isFullscreen()) {
              player.exitFullscreen();
            } else {
              player.requestFullscreen();
            }
          }
        });
      });

      //  Optional: Quality selector
      // if (typeof (player as any).hlsQualitySelector === 'function') {
      //   (player as any).hlsQualitySelector({
      //     displayCurrentQuality: true,
      //   });
      // }
    } else if (playerRef.current) {
      const player = playerRef.current;
      player.src({
        src: videoSrc,
        type: videoMimeType,
      });
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoSrc, videoMimeType]);

  return {
    videoRef,
    playerRef,
  };
};
