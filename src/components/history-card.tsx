"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Volume2,
  VolumeX,
  Info,
  Play,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { WatchlistButton } from "@/components/watchlist-button";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";

interface HistoryCardProps {
  progress: API.WatchProgressDto;
  isEditing?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function HistoryCard({
  progress,
  isEditing = false,
  isSelected = false,
  onToggleSelect,
}: HistoryCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    progress.video?.thumbnailUrl ||
      progress.metadata?.thumbnail ||
      "/default_banner.jpg"
  );

  const [showDetails, setShowDetails] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hoverTimeoutRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = window.setTimeout(
      () => setShowDetails(true),
      500
    );
  };
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowDetails(false);
  };

  const toggleMute = () => {
    if (iframeRef.current) {
      const command = isMuted ? "unMute" : "mute";
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*"
      );
    }
    setIsMuted(!isMuted);
  };

  const handleViewDetail = () => {
    // Navigate to movie detail page based on metadata
    const contentType =
      progress.metadata?.type === "TVSERIES" ? "tv_series" : "movies";
    const Id = progress.movieId || progress.episodeId;
    const title = progress.metadata?.title || "Unknown";

    if (Id && title) {
      // Check if this is an episode
      if (
        progress.episodeId &&
        progress.episodeNumber &&
        progress.seasonNumber
      ) {
        // Navigate to episode page
        const episodeTitle =
          progress.metadata?.episodeTitle ||
          `Episode ${progress.episodeNumber}`;
        const episodeSlug = `${episodeTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${progress.episodeId}`;
        router.push(
          `/tv_series/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${
            progress.tvSeriesId
          }/episode/${episodeSlug}`
        );
      } else {
        // Navigate to movie or TV series detail page
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Id}`;
        router.push(`/${contentType}/${slug}`);
      }
    } else {
      console.error("Missing content information for navigation");
    }
  };

  const handleResume = () => {
    // Navigate to video player with resume functionality
    const contentType =
      progress.metadata?.type === "TVSERIES" ? "tv_series" : "movies";
    const Id = progress.movieId || progress.episodeId;
    const title = progress.metadata?.title || "Unknown";

    if (Id && title) {
      // Check if this is an episode
      if (
        progress.episodeId &&
        progress.episodeNumber &&
        progress.seasonNumber
      ) {
        // Navigate to episode page
        const episodeTitle =
          progress.metadata?.episodeTitle ||
          `Episode ${progress.episodeNumber}`;
        const episodeSlug = `${episodeTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${progress.episodeId}`;
        router.push(
          `/tv_series/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${
            progress.tvSeriesId
          }/episode/${episodeSlug}`
        );
      } else {
        // Navigate to movie or TV series detail page
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Id}`;
        router.push(`/${contentType}/${slug}`);
      }
    } else {
      console.error("Missing content information for navigation");
    }
  };

  // Calculate progress percentage and display text
  const watchedSeconds = progress.watchedDuration;

  // Handle duration conversion: both movies and episodes in minutes
  let totalDurationSeconds = 0;
  // Ensure duration is a number before using it (API may return a record/object)
  if (typeof progress.duration === "number") {
    // Convert minutes to seconds for both movies and episodes
    totalDurationSeconds = progress.duration * 60;
  } else if (typeof progress.metadata?.duration === "number") {
    // Fallback to metadata duration if available
    totalDurationSeconds = progress.metadata.duration * 60;
  }

  // Format watched time
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  const watchedTimeText = formatTime(watchedSeconds);
  const progressText = progress.isCompleted
    ? "Completed"
    : `${watchedTimeText} watched`;

  // Calculate progress percentage if we have total duration
  const progressPercentage =
    totalDurationSeconds > 0
      ? Math.min(100, (watchedSeconds / totalDurationSeconds) * 100)
      : progress.isCompleted
      ? 100
      : 30;

  const title =
    progress.metadata?.title ||
    (typeof progress.contentTitle === "string"
      ? progress.contentTitle
      : progress.contentTitle?.en ||
        progress.contentTitle?.vi ||
        progress.contentTitle?.title ||
        "Unknown Title");

  // Check if this is an episode
  const isEpisode =
    progress.episodeId && progress.episodeNumber && progress.seasonNumber;
  const episodeInfo = isEpisode
    ? `Season ${progress.seasonNumber} . Episode ${progress.episodeNumber}`
    : null;
  // Handle lastWatched date
  const lastWatchedDate =
    typeof progress.lastWatched === "string"
      ? new Date(progress.lastWatched)
      : progress.lastWatched?.date
      ? new Date(progress.lastWatched.date)
      : new Date(progress.updatedAt);

  return (
    <div className="relative w-full h-112 sm:h-116 lg:h-120 flex-shrink-0 overflow-visible">
      <div
        className={`absolute top-0 left-0 w-full h-full flex cursor-pointer origin-center transition-transform duration-500 ease-[ease] rounded-2xl overflow-hidden ${
          showDetails
            ? "scale-125 shadow-[0_40px_120px_-25px_rgba(124,92,255,0.55)] z-50"
            : "scale-100 shadow-none z-10"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 border border-white/10 bg-[#0f1326] overflow-hidden">
          {/* Premium badge */}
          {isPremiumContent(progress.metadata?.accessTier) && (
            <PremiumBadge
              size="sm"
              showLabel
              className="absolute top-3 left-3 z-20"
            />
          )}

          {/* Selection checkbox for edit mode */}
          {isEditing && (
            <div
              className="absolute top-4 right-4 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(progress.id);
              }}
            >
              {isSelected ? (
                <CheckCircle2 className="h-7 w-7 text-purple-400 drop-shadow-lg" />
              ) : (
                <Circle className="h-7 w-7 text-white/70 drop-shadow" />
              )}
            </div>
          )}

          {/* Poster image */}
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="320px"
            priority={false}
            onError={() => setImgSrc("/default_banner.jpg")}
          />

          {/* Progress bar - moved to bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/70 z-10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-400 ease ${
              showDetails
                ? "bg-gradient-to-b from-transparent via-black/70 to-black/100"
                : ""
            }`}
          />

          {/* Info panel */}
          {showDetails && (
            <div className="absolute inset-x-0 bottom-20 flex flex-col gap-3 p-6 text-white">
              <h3
                className="text-2xl font-bold cursor-pointer hover:text-orange-400 transition-colors"
                onClick={handleViewDetail}
              >
                {title}
              </h3>
              {episodeInfo && (
                <p className="text-lg font-medium text-purple-400">
                  {episodeInfo}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                <span>{progressText}</span>
                <span className="text-white/50">•</span>
                <span>
                  Last watched: {lastWatchedDate.toLocaleDateString()}
                </span>
                {progress.metadata?.releaseDate && (
                  <>
                    <span className="text-white/50">•</span>
                    <span>
                      {new Date(progress.metadata.releaseDate).getFullYear()}
                    </span>
                  </>
                )}
                {progress.metadata?.imdbRating && (
                  <>
                    <span className="text-white/50">•</span>
                    <span className="border border-white/35 rounded-lg px-2 py-0.5 text-xs">
                      {progress.metadata.imdbRating}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Buttons row */}
          {showDetails && (
            <div className="absolute inset-x-0 bottom-6 flex gap-3 justify-center px-6">
              <Button
                onClick={handleResume}
                className="flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#7c5cff] to-[#9f8cff] shadow-[0_20px_48px_-22px_rgba(124,92,255,0.9)] transition-transform duration-300 hover:translate-y-[-2px] hover:brightness-105"
              >
                <Play className="w-5 h-5" />{" "}
                {progress.isCompleted ? "Watch Again" : "Resume"}
              </Button>
              <WatchlistButton
                movieId={
                  typeof progress.movieId === "string"
                    ? progress.movieId
                    : String(progress.movieId ?? progress.episodeId ?? "")
                }
                contentId={progress.metadata?.id}
                type={progress.metadata?.type || "MOVIE"}
                variant="default"
                size="default"
                className="flex-1 rounded-full px-6 py-3 font-semibold text-white bg-[#212436]/95 border border-white/12 shadow-[0_16px_36px_-24px_rgba(17,19,35,0.8)] transition-transform duration-300 hover:translate-y-[-2px] hover:bg-[#2d3246]/98"
              />
            </div>
          )}

          {/* Info khi chưa hover */}
          {!showDetails && (
            <div className="absolute left-0 right-0 bottom-0 p-4 text-white">
              <h3
                className="text-lg font-semibold cursor-pointer hover:text-orange-400 transition-colors"
                onClick={handleViewDetail}
              >
                {title}
              </h3>
              {episodeInfo && (
                <p className="text-sm font-medium text-purple-400 mb-1">
                  {episodeInfo}
                </p>
              )}
              <p className="text-sm text-white/70">
                {progressText}
                {progress.metadata?.releaseDate &&
                  ` • ${new Date(progress.metadata.releaseDate).getFullYear()}`}
                {progress.metadata?.imdbRating &&
                  ` • ${progress.metadata.imdbRating}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
