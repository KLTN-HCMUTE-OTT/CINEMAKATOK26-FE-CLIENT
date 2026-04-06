"use client";

import React from "react";
import { VideoControls } from "./VideoControls";
import { SkipBack, SkipForward } from "lucide-react";

interface TVSeriesVideoControlsProps {
  // Các props giống VideoControls
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: string;
  availableQualities: Array<{ label: string; height: number; index: number }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  volumeBarRef: React.RefObject<HTMLDivElement | null>;
  onTogglePlay: () => void;
  onSkip: (seconds: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
  onVolumeMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onVolumeMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onVolumeMouseLeave?: () => void;
  onToggleFullscreen: () => void;
  onTogglePIP: () => void;
  onChangeQuality: (quality: string) => void;
  onChangePlaybackRate: (rate: number) => void;
  onMenuOpenChange: (open: boolean) => void;
  formatTime: (seconds: number) => string;
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onToggleFavorite?: () => void;
  onToggleWatchlist?: () => void;
  onOpenRating?: () => void;
  showVolumeTooltip?: boolean;
  volumeHoverValue?: number;
  dragVolume?: number | null;
  // Props cho TV series
  episodeIndex: number;
  totalEpisodes: number;
  onPrevEpisode: () => void;
  onNextEpisode: () => void;
}

export function TVSeriesVideoControls(props: TVSeriesVideoControlsProps) {
  // console.log(
  //   "Rendering TVSeriesVideoControls with episodeIndex:",
  //   props.episodeIndex
  // );
  // console.log(
  //   "Rendering TVSeriesVideoControls with totalEpisodes:",
  //   props.totalEpisodes
  // );
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4">
      {/* Left Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Nút chuyển tập trước */}
        <button
          onClick={props.onPrevEpisode}
          disabled={props.episodeIndex <= 0}
          title="Tập trước"
          className="text-white hover:text-purple-400 transition-colors p-1 md:p-2"
        >
          <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        {/* Nút chuyển tập sau */}
        <button
          onClick={props.onNextEpisode}
          disabled={props.episodeIndex > props.totalEpisodes - 1}
          title="Tập tiếp theo"
          className="text-white hover:text-purple-400 transition-colors p-1 md:p-2"
        >
          <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        {/* Các controls còn lại dùng lại từ VideoControls */}
        <VideoControls {...props} />
        {/* Hiển thị số tập */}
        <span className="text-white text-xs md:text-sm ml-2">
          Tập {props.episodeIndex}/{props.totalEpisodes}
        </span>
      </div>
    </div>
  );
}
