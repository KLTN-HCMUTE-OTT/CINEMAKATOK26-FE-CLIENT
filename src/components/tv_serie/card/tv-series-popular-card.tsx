"use client";

import { Button } from "@/components/ui/button";
import { WatchlistButton } from "@/components/watchlist-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";

interface TvSeriesPopularCardProps {
  series: API.TVSeriesSummaryDto;
}

export function TvSeriesPopularCard({ series }: TvSeriesPopularCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    series?.metaData?.thumbnail || "/default-banner.jpg"
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
    router.push(`/tv_series/${series.metaData.title}-${series.id}`);
  };

  // Process youtube trailer id from series.metaData.trailer
  const youtubeTrailerId = series.metaData.trailer?.split("v=")[1];

  return (
    <div className="relative w-full aspect-[3/4] flex-shrink-0 overflow-visible">
      <div
        className={`absolute top-0 left-0 w-full flex flex-col cursor-pointer origin-center transition-all duration-500 ease-[ease] rounded-xl overflow-hidden ${
          showDetails
            ? "scale-125 shadow-[0_40px_120px_-25px_rgba(124,92,255,0.55)] z-50"
            : "scale-100 shadow-none z-0"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image/Video Section */}
        <div className="relative w-full aspect-[4/3] border border-white/10 bg-[#0f1326] overflow-hidden">
          {/* Premium badge */}
          {isPremiumContent(series.metaData.accessTier) && (
            <PremiumBadge
              size="sm"
              showLabel
              className="absolute top-2 right-2 z-30"
            />
          )}
          {/* Trailer iframe - chiếm toàn bộ phần ảnh */}
          {series.metaData.trailer && showDetails ? (
            <div className="absolute inset-0">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${youtubeTrailerId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeTrailerId}&modestbranding=1&enablejsapi=1`}
                className="absolute inset-0 w-full h-full object-cover border-0"
                allow="autoplay; encrypted-media"
              />
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/55 flex items-center justify-center backdrop-blur-md shadow-lg transition hover:bg-black/75 z-50"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={series.metaData.title || "TV Series poster"}
              fill
              className="object-cover"
              sizes="500px"
              priority={false}
              onError={() => setImgSrc("/default_banner.jpg")}
            />
          )}
        </div>

        {/* Info Section - luôn hiển thị ở dưới */}
        <div className="w-full bg-[#0f1326] border-x border-b border-white/10 text-white">
          {showDetails ? (
            // Info khi hover - có buttons
            <div className="flex flex-col gap-4 p-5">
              {/* Title and info */}
              <div className="flex flex-col gap-2">
                <h3
                  className="text-sm font-bold cursor-pointer hover:text-orange-400 transition-colors line-clamp-1"
                  onClick={handleViewDetail}
                >
                  {series.metaData.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                  <span>{series.metaData.releaseDate}</span>
                  <span className="text-white/50">•</span>
                  <span>
                    {series.totalSeasons} Season
                    {series.totalSeasons > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Buttons row */}
              <div className="flex gap-3">
                <Button
                  onClick={handleViewDetail}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7c5cff] to-[#9f8cff] shadow-[0_20px_48px_-22px_rgba(124,92,255,0.9)] transition-all duration-300 hover:translate-y-[-2px] hover:brightness-110"
                >
                  <Info className="w-5 h-5" /> View Detail
                </Button>
                <WatchlistButton
                  movieId={series.id}
                  contentId={series.metaData.id}
                  type={series.metaData.type}
                  variant="default"
                  size="default"
                  className="flex-1 rounded-full px-6 py-3.5 text-sm font-semibold text-white bg-[#212436]/95 border border-white/12 shadow-[0_16px_36px_-24px_rgba(17,19,35,0.8)] transition-all duration-300 hover:translate-y-[-2px] hover:bg-[#2d3246]/98"
                />
              </div>
            </div>
          ) : (
            // Info khi chưa hover - compact
            <div className="p-4">
              <h3
                className="text-xl font-bold cursor-pointer hover:text-orange-400 transition-colors line-clamp-1 mb-2"
                onClick={handleViewDetail}
              >
                {series.metaData.title}
              </h3>
              <p className="text-base text-white/70">
                {series.metaData.releaseDate}{" "}
                <span className="text-white/40 mx-1.5">•</span>{" "}
                {series.totalSeasons} Season
                {series.totalSeasons > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
