/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Play, Film, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getS3Url } from "@/hooks/aws";
import { ResumeDialog } from "@/components/ui/resume-dialog";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { videosControllerGetVideoById } from "@/apis/api/videos";
import MovieVideoPlayerComponent from "../ui/video-player/movie-video-player";
interface MovieDetailHeroVideoProps {
  title: string;
  backdropUrl: string;
  posterUrl: string;
  trailerUrl?: string; // YouTube video ID or full URL
  videoSources?: {
    url?: string;
    type: string; // MIME type: 'application/x-mpegURL' for HLS
  };
  movieId?: string;
  videoId?: string; // New prop for video ID
}

type ViewMode = "idle" | "trailer" | "movie";

export function MovieDetailHeroVideo({
  title,
  backdropUrl,
  posterUrl,
  trailerUrl,
  videoSources,
  movieId,
  videoId,
}: MovieDetailHeroVideoProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [selectedSource, setSelectedSource] = useState(0);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [skipInitialTime, setSkipInitialTime] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  // Fetch watch progress and resume data
  const { resumeData, isLoading: progressLoading } = useWatchProgress({
    videoId,
    enabled: true,
    contentType: "movie",
  });

  useEffect(() => {
    if (videoId) {
      videosControllerGetVideoById({ id: videoId })
        .then((res) => {
          setVideoDetails(res.data);
        })
        .catch((err) => console.error("Failed to fetch video details", err));
    }
  }, [videoId]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("embed")) return url;

    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : url;

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&enablejsapi=1`;
  };

  const handleSourceChange = (index: number) => {
    setSelectedSource(index);
    setViewMode("movie");
  };

  // Handle watch movie button click - show resume dialog if has progress
  const handleWatchMovieClick = () => {
    if (resumeData && resumeData.watchedDuration > 0) {
      setShowResumeDialog(true);
    } else {
      setViewMode("movie");
    }
  };

  // Handle resume from last position
  const handleResume = () => {
    setShowResumeDialog(false);
    setSkipInitialTime(false);
    setViewMode("movie");
    // Video player will auto-seek to resumeData.watchedDuration via useWatchProgress hook
  };

  // Handle start over
  const handleStartOver = () => {
    setShowResumeDialog(false);
    setSkipInitialTime(true);
    setViewMode("movie");
    // Video player will start from 0
  };

  //Thay props saau nay
  //const { videoContent } = useVideoAccess(videoSources?.url || "");
  const videoContent = {
    src: getS3Url(videoSources?.url || ""),
    type: videoSources?.type || "application/x-mpegURL",
  };
  return (
    <div className="relative w-full bg-black">
      {/* Video Container */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "85vh" }}
      >
        {viewMode === "idle" ? (
          <>
            {/* Backdrop Image */}
            <div className="absolute inset-0">
              <Image
                src={backdropUrl}
                alt={title}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Play Buttons Overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-6">
              {/* Watch Movie Button */}
              <Button
                size="lg"
                onClick={handleWatchMovieClick}
                className="bg-orange-500/90 hover:bg-orange-600 text-white rounded-full px-8 py-8 shadow-2xl transition-all hover:scale-110 flex flex-col items-center gap-2"
              >
                <Film className="w-16 h-16" />
                <span className="text-sm font-semibold">Watch Movie</span>
              </Button>

              {/* Watch Trailer Button */}
              {trailerUrl && (
                <Button
                  size="lg"
                  onClick={() => setViewMode("trailer")}
                  className="bg-purple-500/90 hover:bg-purple-600 text-white rounded-full px-8 py-8 shadow-2xl transition-all hover:scale-110 flex flex-col items-center gap-2"
                >
                  <Play className="w-16 h-16 fill-white" />
                  <span className="text-sm font-semibold">Watch Trailer</span>
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Video Player - VideoJS for Movie, YouTube for Trailer */}
            {viewMode === "movie" ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                {/* Video Player */}
                {videoContent && (
                  <MovieVideoPlayerComponent
                    {...videoContent}
                    autoPlay={true}
                    movieId={movieId}
                    videoId={videoId}
                    initialTime={
                      skipInitialTime ? 0 : resumeData?.watchedDuration
                    }
                    sprites={videoDetails?.sprites}
                    vttFiles={videoDetails?.vttFiles}
                    onTimeUpdate={(currentTime) => {
                      // Callback to update duration when available
                    }}
                  />
                )}
              </div>
            ) : (
              <iframe
                src={trailerUrl ? getYouTubeEmbedUrl(trailerUrl) : ""}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("idle")}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* View Mode Indicator */}
            <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {viewMode === "trailer" ? "Trailer" : "Movie"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Controls - Outside video, below it */}
      <div className="flex justify-center items-center gap-4 py-4 bg-gray-900">
        {/* Quick Actions */}
        {viewMode !== "idle" && trailerUrl && (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setViewMode(viewMode === "trailer" ? "movie" : "trailer")
              }
              className="bg-gray-700/50 text-gray-200 hover:bg-gray-600 px-4 py-2 rounded-md text-sm"
            >
              {viewMode === "trailer" ? "Switch to Movie" : "Switch to Trailer"}
            </Button>
          </div>
        )}
      </div>

      {/* Resume Dialog */}
      <ResumeDialog
        isOpen={showResumeDialog}
        isLoading={progressLoading}
        contentTitle={title}
        watchedDuration={resumeData?.watchedDuration || 0}
        totalDuration={0} // We don't have total duration here, will be handled by video player
        onResume={handleResume}
        onStartOver={handleStartOver}
        onClose={() => setShowResumeDialog(false)}
      />
    </div>
  );
}
