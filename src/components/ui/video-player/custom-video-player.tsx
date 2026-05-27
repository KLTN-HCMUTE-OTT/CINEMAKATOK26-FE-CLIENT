"use client";

import React, { useState } from "react";
import { useVideoPlayer } from "./useVideoPlayer";
import { LoadingSpinner } from "./LoadingSpinner";
import { PlayButton } from "./PlayButton";
import { ProgressBar } from "./ProgressBar";
import { VideoControls } from "./VideoControls";
import { RatingDialog } from "./RatingDialog";
import { TVSeriesVideoControls } from "./TVSeriesVideoControls";
import { useActions } from "@/contexts/movie-actions-context";
import { useUIStore } from "@/store";
import { isAuthenticated } from "@/lib/auth";
import { AlertCircle, RotateCcw } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  // Content IDs for API integration
  videoId?: string; // New preferred parameter
  movieId?: string;
  episodeId?: string | null;
  contentType?: "movie" | "tv_series" | null;
  initialTime?: number;
  sprites?: string[];
  vttFiles?: string[];
  // TV Series specific props
  episodeIndexProp?: number;
  totalEpisodesProp?: number;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  drmKeyId?: string | null;
}

export function CustomVideoPlayer({
  src,
  type = "application/x-mpegURL",
  poster,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  videoId,
  movieId,
  episodeId,
  contentType = "movie",
  initialTime,
  sprites,
  vttFiles,
  episodeIndexProp,
  totalEpisodesProp,
  onPrevEpisode,
  onNextEpisode,
  drmKeyId,
}: VideoPlayerProps) {
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  // Video player state and controls
  const {
    videoRef,
    containerRef,
    progressBarRef,
    volumeBarRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    buffered,
    playbackRate,
    quality,
    availableQualities,
    isLoading,
    error,
    tooltipTime,
    tooltipPosition,
    showProgressTooltip,
    volumeHoverValue,
    showVolumeTooltip,
    dragTime,
    dragVolume,
    formatTime,
    retryVideo,
    togglePlay,
    changeQuality,
    handleSeek,
    handleProgressMouseDown,
    handleProgressMouseMove,
    handleProgressMouseLeave,
    handleVolumeChange,
    handleVolumeMouseDown,
    handleVolumeMouseMove,
    handleVolumeMouseLeave,
    toggleMute,
    skip,
    toggleFullscreen,
    togglePIP,
    handleMouseMove,
    handleMouseLeave,
    setIsMenuOpen,
    changePlaybackRate,
    prevEpisode,
    nextEpisode,
    episodeIndex,
    totalEpisodes,
  } = useVideoPlayer({
    src,
    type,
    autoPlay,
    onTimeUpdate,
    onEnded,
    videoId,
    episodeId,
    contentType,
    initialTime,
    // pass through series props if available
    episodeIndex: episodeIndexProp,
    totalEpisodes: totalEpisodesProp,
    onPrevEpisode,
    onNextEpisode,
    drmKeyId,
  });

  // Get shared state from context (favorite, watchlist)
  const {
    isFavorite,
    toggleFavorite: contextToggleFavorite,
    isInWatchlist,
    toggleWatchlist: contextToggleWatchlist,
  } = useActions();

  // Wrap toggle functions to pass container for modal rendering
  const toggleFavorite = () => {
    if (!isLoggedIn() && containerRef.current) {
      openLoginModal(containerRef.current);
      return;
    }
    contextToggleFavorite();
  };

  const toggleWatchlist = () => {
    if (!isLoggedIn() && containerRef.current) {
      openLoginModal(containerRef.current);
      return;
    }
    contextToggleWatchlist();
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return isAuthenticated();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full max-h-screen"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain max-h-screen"
        poster={poster}
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {/* Loading Spinner */}
      {isLoading && !error && <LoadingSpinner />}

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoading && !error && <PlayButton onClick={togglePlay} />}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500 animate-pulse">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
          <p className="text-zinc-400 max-w-md mb-6 text-sm md:text-base leading-relaxed">
            {error}
          </p>
          <button
            onClick={retryVideo}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="px-4 md:px-6 pb-4">
          {/* Progress Bar */}
          <div className="pt-4">
            <ProgressBar
              progressBarRef={progressBarRef}
              buffered={buffered}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseLeave={handleProgressMouseLeave}
              showTooltip={showProgressTooltip}
              tooltipTime={tooltipTime}
              tooltipPosition={tooltipPosition}
              formatTime={formatTime}
              dragTime={dragTime}
              sprites={sprites}
              vttFiles={vttFiles}
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between gap-2 md:gap-4 mt-2">
            {typeof episodeIndex !== "undefined" ? (
              <TVSeriesVideoControls
                // spread all shared control props
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                playbackRate={playbackRate}
                quality={quality}
                availableQualities={availableQualities}
                containerRef={containerRef}
                volumeBarRef={volumeBarRef}
                onTogglePlay={togglePlay}
                onSkip={skip}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
                onVolumeMouseDown={handleVolumeMouseDown}
                onVolumeMouseMove={handleVolumeMouseMove}
                onVolumeMouseLeave={handleVolumeMouseLeave}
                onToggleFullscreen={toggleFullscreen}
                onTogglePIP={togglePIP}
                onChangeQuality={changeQuality}
                onChangePlaybackRate={changePlaybackRate}
                onMenuOpenChange={setIsMenuOpen}
                formatTime={formatTime}
                isFavorite={isFavorite}
                isInWatchlist={isInWatchlist}
                onToggleFavorite={toggleFavorite}
                onToggleWatchlist={toggleWatchlist}
                onOpenRating={() => setIsRatingDialogOpen(true)}
                showVolumeTooltip={showVolumeTooltip}
                volumeHoverValue={volumeHoverValue}
                dragVolume={dragVolume}
                // TV series props from hook
                episodeIndex={episodeIndex ?? 0}
                totalEpisodes={totalEpisodes ?? 0}
                onPrevEpisode={prevEpisode}
                onNextEpisode={nextEpisode}
              />
            ) : (
              <VideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                playbackRate={playbackRate}
                quality={quality}
                availableQualities={availableQualities}
                containerRef={containerRef}
                volumeBarRef={volumeBarRef}
                onTogglePlay={togglePlay}
                onSkip={skip}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
                onVolumeMouseDown={handleVolumeMouseDown}
                onVolumeMouseMove={handleVolumeMouseMove}
                onVolumeMouseLeave={handleVolumeMouseLeave}
                onToggleFullscreen={toggleFullscreen}
                onTogglePIP={togglePIP}
                onChangeQuality={changeQuality}
                onChangePlaybackRate={changePlaybackRate}
                onMenuOpenChange={setIsMenuOpen}
                formatTime={formatTime}
                isFavorite={isFavorite}
                isInWatchlist={isInWatchlist}
                onToggleFavorite={toggleFavorite}
                onToggleWatchlist={toggleWatchlist}
                onOpenRating={() => setIsRatingDialogOpen(true)}
                showVolumeTooltip={showVolumeTooltip}
                volumeHoverValue={volumeHoverValue}
                dragVolume={dragVolume}
              />
            )}
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <RatingDialog
        isOpen={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        container={containerRef.current}
      />
    </div>
  );
}
