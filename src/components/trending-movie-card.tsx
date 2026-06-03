"use client";

import { useState, useRef, useEffect } from "react";
import { Bookmark, Volume2, VolumeX, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { WatchlistButton } from "@/components/watchlist-button";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";

interface TrendingMovieCardProps {
  movie: API.MovieDto;
}

export function TrendingMovieCard({ movie }: TrendingMovieCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    movie?.metaData?.thumbnail || "/default-banner.jpg"
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
    router.push(`/movies/${movie.metaData.title}-${movie.id}`);
  };

  //process youtube trailer id from movie.metaData.trailer https://www.youtube.com/watch?v=PssKpzB0Ah0
  const youtubeTrailerId = movie.metaData.trailer.split("v=")[1];

  return (
    <div className="relative w-full h-112 sm:h-116 lg:h-120 flex-shrink-0 overflow-visible">
      <div
        className={`absolute top-0 left-0 w-full h-full flex cursor-pointer origin-center transition-transform duration-500 ease-[ease] rounded-2xl overflow-hidden ${
          showDetails
            ? "scale-125 shadow-[0_40px_120px_-25px_rgba(124,92,255,0.55)]"
            : "scale-100 shadow-none"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 border border-white/10 bg-[#0f1326] overflow-hidden">
          {/* Premium badge – always visible top-right */}
          {isPremiumContent(movie.metaData.accessTier) && (
            <PremiumBadge
              size="sm"
              showLabel
              className="absolute top-3 right-3 z-30"
            />
          )}
          {/* 1️⃣ Trailer iframe */}
          {movie.metaData.trailer && showDetails ? (
            <div className="relative w-full h-full">
              {/* Mute button */}

              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${youtubeTrailerId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&modestbranding=1&enablejsapi=1`}
                className="absolute inset-0 w-full h-full object-cover border-0 -top-16"
                allow="autoplay; encrypted-media"
              />
              {/* Mute button nổi trên góc phải */}
              <button
                onClick={toggleMute}
                className="absolute top-12 right-4 w-12 h-12 rounded-full bg-black/55 flex items-center justify-center backdrop-blur-md shadow-lg transition hover:bg-black/75 z-50"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={movie.metaData.title || "Movie poster"}
              fill
              className="object-cover"
              sizes="320px"
              priority={false}
              onError={() => setImgSrc("/default_banner.jpg")}
            />
          )}

          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-400 ease ${
              showDetails
                ? "bg-gradient-to-b from-transparent via-black/70 to-black/100"
                : ""
            }`}
          />

          {/* 2️⃣ Info panel */}
          {showDetails && (
            <div className="absolute inset-x-0 bottom-20 flex flex-col gap-3 p-6 text-white">
              <h3
                className="text-2xl font-bold cursor-pointer hover:text-orange-400 transition-colors"
                onClick={handleViewDetail}
              >
                {movie.metaData.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                <span>{movie.metaData.releaseDate}</span>
                <span className="text-white/50">•</span>
                <span>{movie.duration}</span>
                <span className="text-white/50">•</span>
                <span className="border border-white/35 rounded-lg px-2 py-0.5 text-xs">
                  {movie.metaData.imdbRating}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                {movie.metaData.categories.map((g, idx) => (
                  <span key={g.id ?? g.categoryName}>
                    {g.categoryName}
                    {idx < movie.metaData.categories.length - 1 && (
                      <span className="text-white/50">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3️⃣ Buttons row */}
          {showDetails && (
            <div className="absolute inset-x-0 bottom-6 flex gap-3 justify-center px-6">
              <Button
                onClick={handleViewDetail}
                className="flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#7c5cff] to-[#9f8cff] shadow-[0_20px_48px_-22px_rgba(124,92,255,0.9)] transition-transform duration-300 hover:translate-y-[-2px] hover:brightness-105"
              >
                <Info className="w-5 h-5" /> View Detail
              </Button>
              <WatchlistButton
                movieId={movie.id}
                contentId={movie.metaData.id}
                type={movie.metaData.type}
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
                {movie.metaData.title}
              </h3>
              <p className="text-sm text-white/70">
                {movie.metaData.releaseDate} • {movie.duration} •{" "}
                {movie.metaData.imdbRating}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
