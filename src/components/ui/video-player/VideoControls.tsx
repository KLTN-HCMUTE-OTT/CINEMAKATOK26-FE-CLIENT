"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  PictureInPicture,
  Heart,
  Plus,
  Star,
  FastForward,
  Rewind,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoControlsProps {
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
  // New props for fullscreen actions
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  onToggleFavorite?: () => void;
  onToggleWatchlist?: () => void;
  onOpenRating?: () => void;
  // Volume tooltip props
  showVolumeTooltip?: boolean;
  volumeHoverValue?: number;
  dragVolume?: number | null;
}

export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  playbackRate,
  quality,
  availableQualities,
  containerRef,
  volumeBarRef,
  onTogglePlay,
  onSkip,
  onToggleMute,
  onVolumeChange,
  onVolumeMouseDown,
  onVolumeMouseMove,
  onVolumeMouseLeave,
  onToggleFullscreen,
  onTogglePIP,
  onChangeQuality,
  onChangePlaybackRate,
  onMenuOpenChange,
  formatTime,
  isFavorite = false,
  isInWatchlist = false,
  onToggleFavorite,
  onToggleWatchlist,
  onOpenRating,
  showVolumeTooltip = false,
  volumeHoverValue = 0,
  dragVolume = null,
}: VideoControlsProps) {
  const displayQuality = quality === "auto" ? "Auto" : quality;
  // Use dragVolume during drag, otherwise use volume
  const displayVolume = dragVolume !== null ? dragVolume : volume;
  const [localDragVolume, setLocalDragVolume] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localHoverVolume, setLocalHoverVolume] = useState<number | null>(null);
  const [showLocalTooltip, setShowLocalTooltip] = useState(false);

  // Listen for mouseup on document to handle drag end anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setLocalDragVolume(null);
      setLocalHoverVolume(null);
      setShowLocalTooltip(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && volumeBarRef.current) {
        const rect = volumeBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const vol = Math.max(0, Math.min(1, pos));
        setLocalDragVolume(vol);
        // Don't update hover volume during drag
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }
  }, [isDragging]);

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onVolumeMouseDown?.(e);
  };

  const handleLocalVolumeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const vol = Math.max(0, Math.min(1, pos));
      if (isDragging) {
        setLocalDragVolume(vol);
      }
      setLocalHoverVolume(vol);
      setShowLocalTooltip(true);
    }
    onVolumeMouseMove?.(e);
  };

  const handleLocalVolumeMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't reset here, global mouseup handler will handle it
  };

  const handleLocalVolumeMouseLeave = () => {
    setLocalHoverVolume(null);
    setShowLocalTooltip(false);
    onVolumeMouseLeave?.();
  };

  // Use localDragVolume for smooth visual feedback only during drag
  const displayVolumeLocal =
    localDragVolume !== null ? localDragVolume : displayVolume;
  // Use local hover volume for tooltip display
  const tooltipVolume =
    localHoverVolume !== null ? localHoverVolume : volumeHoverValue;
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4">
      {/* Left Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}
          className="text-white hover:text-purple-400 transition-colors p-1 md:p-2"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          )}
        </button>

        {/* Skip Backward */}
        <button
          onClick={() => onSkip(-10)}
          title="Tua lùi 10 giây (←)"
          className="hidden md:block text-white hover:text-purple-400 transition-colors p-2"
        >
          <Rewind className="w-5 h-5" />
        </button>

        {/* Skip Forward */}
        <button
          onClick={() => onSkip(10)}
          title="Tua tới 10 giây (→)"
          className="hidden md:block text-white hover:text-purple-400 transition-colors p-2"
        >
          <FastForward className="w-5 h-5" />
        </button>

        {/* Volume Controls */}
        <div className="hidden md:flex items-center gap-2 group/volume">
          <button
            onClick={onToggleMute}
            title={isMuted ? "Bật âm thanh (M)" : "Tắt âm thanh (M)"}
            className="text-white hover:text-purple-400 transition-colors p-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <div className="relative">
            {/* Volume Tooltip */}
            {showLocalTooltip && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-50">
                {Math.round(tooltipVolume * 100)}%
              </div>
            )}
            <div
              ref={volumeBarRef}
              className="w-0 group-hover/volume:w-20 overflow-visible transition-all duration-300"
              onClick={onVolumeChange}
              onMouseDown={handleVolumeMouseDown}
              onMouseMove={handleLocalVolumeMouseMove}
              onMouseUp={handleLocalVolumeMouseUp}
              onMouseLeave={handleLocalVolumeMouseLeave}
            >
              <div className="h-1.5 bg-white/30 rounded-full cursor-pointer">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${displayVolumeLocal * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-white text-xs md:text-sm font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Fullscreen Actions - Only show when fullscreen */}
        {isFullscreen && (
          <>
            {/* Favorite Button */}
            <button
              onClick={onToggleFavorite}
              title={isFavorite ? "Bỏ thích" : "Thích"}
              className={`hidden md:block p-2 rounded transition-all ${
                isFavorite
                  ? "text-red-500 hover:text-red-600"
                  : "text-white hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>

            {/* Watchlist Button */}
            <button
              onClick={onToggleWatchlist}
              title={
                isInWatchlist ? "Xóa khỏi danh sách" : "Thêm vào danh sách"
              }
              className={`hidden md:block p-2 rounded transition-all ${
                isInWatchlist
                  ? "text-purple-500 hover:text-purple-600"
                  : "text-white hover:text-purple-500"
              }`}
            >
              <Plus
                className={`w-5 h-5 ${
                  isInWatchlist ? "rotate-45" : ""
                } transition-transform`}
              />
            </button>

            {/* Rating Button */}
            <button
              onClick={onOpenRating}
              title="Đánh giá"
              className="hidden md:block text-white hover:text-yellow-400 transition-colors p-2"
            >
              <Star className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className="hidden md:block h-6 w-px bg-gray-600 mx-1" />
          </>
        )}

        {/* Quality Selector */}
        <DropdownMenu modal={false} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <button
              title="Chất lượng video"
              className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded text-white hover:text-purple-400 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">{displayQuality}</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-gray-900 border-gray-700"
            container={containerRef.current}
            sideOffset={5}
          >
            <DropdownMenuItem
              onClick={() => onChangeQuality("Auto")}
              className={`text-white hover:bg-gray-800 ${
                displayQuality === "Auto" ? "bg-gray-800" : ""
              }`}
            >
              Auto {displayQuality === "Auto" && "✓"}
            </DropdownMenuItem>

            {availableQualities.map((q) => (
              <DropdownMenuItem
                key={q.index}
                onClick={() => onChangeQuality(q.label)}
                className={`text-white hover:bg-gray-800 ${
                  displayQuality === q.label ? "bg-gray-800" : ""
                }`}
              >
                {q.label} {displayQuality === q.label && "✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Playback Speed */}
        <DropdownMenu modal={false} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <button
              title="Tốc độ phát"
              className="hidden lg:flex items-center px-2 py-1.5 rounded text-white hover:text-purple-400 transition-colors text-sm font-medium"
            >
              {playbackRate}x
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-gray-900 border-gray-700"
            container={containerRef.current}
            sideOffset={5}
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <DropdownMenuItem
                key={rate}
                onClick={() => onChangePlaybackRate(rate)}
                className="text-white hover:bg-gray-800"
              >
                {rate}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* PIP */}
        <button
          onClick={onTogglePIP}
          title="Picture-in-Picture"
          className="hidden md:block text-white hover:text-purple-400 transition-colors p-2"
        >
          <PictureInPicture className="w-5 h-5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}
          className="text-white hover:text-purple-400 transition-colors p-1 md:p-2"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <Maximize className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
