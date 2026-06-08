"use client";

import {
  Play,
  Star,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMovieData } from "@/hooks/use-movies";
import { handleDuration } from "./expanding-movie-card";
import { WatchlistButton } from "@/components/watchlist-button";

export function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const { result, isLoading, error } = useMovieData({
    type: "trending",
    page: 1,
    limit: 3,
  });
  const getYouTubeId = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : url;

    return videoId;
  };
  const movies =
    result?.data.map((movie) => ({
      id: movie.id.toString(),
      contentId: movie.metaData.id,
      title: movie.metaData.title,
      year: movie.metaData.releaseDate || "Year",
      duration: handleDuration(movie.duration) || "120 min",
      trailer: getYouTubeId(movie.metaData.trailer) || "/",
      poster: movie.metaData.thumbnail || "/placeholder.jpg",
      genres: movie.metaData.categories || [],
      rating: movie.metaData.avgRating || 0,
      ageRating: movie.metaData.maturityRating || "PG-13",
      description: movie.metaData.description || "No description available.",
    })) || [];

  const currentMovie = movies[currentSlide];

  useEffect(() => {
    setIsTrailerPlaying(false);
    const timer = setTimeout(() => {
      setIsTrailerPlaying(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length);
    setIsTrailerPlaying(false);
    setPlayerKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
    setIsTrailerPlaying(false);
    setPlayerKey((prev) => prev + 1);
  };

  const toggleMute = () => {
    if (!iframeRef.current) return;

    // gửi lệnh bật/tắt âm thanh
    const command = isMuted ? "unMute" : "mute";
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*"
    );

    setIsMuted(!isMuted);
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error loading movies</div>
      </div>
    );
  }

  // No movies state
  if (!currentMovie || movies.length === 0) {
    return (
      <div className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No movies available</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Background Video/Image */}
      {isTrailerPlaying ? (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            key={playerKey}
            className="w-full h-full object-cover"
            src={`https://www.youtube.com/embed/${currentMovie.trailer}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&loop=1&playlist=${currentMovie.trailer}&enablejsapi=1`}
            title={`${currentMovie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              pointerEvents: "none",
              width: "100vw",
              height: "100vh",
              transform: "scale(1.2)",
              transformOrigin: "center center",
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: currentMovie.poster
              ? `url('${currentMovie.poster}')`
              : "url('/placeholder.jpg')",
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/30 z-10" />

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white/60 hover:text-white transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white/60 hover:text-white transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main content with position animation */}
      <div
        className={`relative z-20 transition-all duration-1000 ease-in-out
    ${
      isTrailerPlaying
        ? "h-screen flex items-end justify-start pb-24"
        : "h-screen flex items-center justify-start"
    }`}
      >
        {/* bỏ container, dùng padding thủ công */}
        <div className="pl-12 pr-6 max-w-2xl">
          {/* Genre tags */}
          <div className="mb-4">
            <span className="text-blue-400 text-sm font-medium uppercase tracking-widest">
              {currentMovie.genres.map((genre, index) => (
                <span key={index}>
                  {genre.categoryName}
                  {index < currentMovie.genres.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {currentMovie.title}
          </h1>

          {/* Movie details */}
          <div className="flex items-center space-x-4 mb-6 text-white text-base">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{currentMovie.rating}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>{currentMovie.year}</span>
            <span className="text-gray-400">•</span>
            <span>{currentMovie.duration}</span>
            <span className="text-gray-400">•</span>
            <span className="bg-gray-600 px-2 py-1 rounded text-xs font-medium">
              {currentMovie.ageRating}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() =>
                router.push(`/movies/${currentMovie.title}-${currentMovie.id}`)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 text-base font-medium transition-all duration-200 hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Now</span>
            </Button>
            <WatchlistButton
              movieId={currentMovie.id}
              contentId={currentMovie.contentId}
              type="MOVIE"
              variant="default"
              size="lg"
              className="border-gray-400 text-white hover:bg-white/10 hover:border-white bg-transparent font-medium transition-all duration-200"
            />
          </div>
        </div>

        {/* Pagination & Volume Control - Right Side */}
        <div className="absolute bottom-32 right-12 flex items-center space-x-6 text-white">
          <div className="flex items-center space-x-6 text-white">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold">{currentSlide + 1}</span>
              <div className="w-50 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentSlide + 1) / movies.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xl font-bold text-white/50">
                {movies.length}
              </span>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
