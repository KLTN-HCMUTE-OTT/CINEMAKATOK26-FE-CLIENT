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
  initialTime?: number;
  sprites?: string[];
  vttFiles?: string[];
  // TV Series specific props
  episodeIndexProp?: number;
  totalEpisodesProp?: number;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
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
  initialTime,
  sprites,
  vttFiles,
  episodeIndexProp,
  totalEpisodesProp,
  onPrevEpisode,
  onNextEpisode,
}: VideoPlayerProps) {
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
    tooltipTime,
    tooltipPosition,
    showProgressTooltip,
    volumeHoverValue,
    showVolumeTooltip,
    dragTime,
    dragVolume,
    formatTime,
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
    initialTime,
    // pass through series props if available
    episodeIndex: episodeIndexProp,
    totalEpisodes: totalEpisodesProp,
    onPrevEpisode,
    onNextEpisode,
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
    // Dispatch event with container if needed for login
    if (!isLoggedIn() && containerRef.current) {
      window.dispatchEvent(
        new CustomEvent("open-login-modal", {
          detail: { container: containerRef.current },
        })
      );
      return;
    }
    contextToggleFavorite();
  };

  const toggleWatchlist = () => {
    // Dispatch event with container if needed for login
    if (!isLoggedIn() && containerRef.current) {
      window.dispatchEvent(
        new CustomEvent("open-login-modal", {
          detail: { container: containerRef.current },
        })
      );
      return;
    }
    contextToggleWatchlist();
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
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
      {isLoading && <LoadingSpinner />}

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoading && <PlayButton onClick={togglePlay} />}

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
