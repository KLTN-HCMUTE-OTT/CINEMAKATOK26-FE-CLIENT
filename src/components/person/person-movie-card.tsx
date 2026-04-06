"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WatchlistButton } from "@/components/watchlist-button";

interface PersonMovieCardProps {
  id: string;
  contentId: string;
  title: string;
  year: number;
  duration?: string;
  image: string;
  description?: string;
  type: "movie" | "tv";
}

export function PersonMovieCard({
  id,
  title,
  contentId,
  year,
  duration,
  image,
  description,
  type,
}: PersonMovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(image || "/default_banner.jpg");
  const handleDuration = (durationStr: string) => {
    const totalMinutes = parseInt(durationStr, 10);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Link
      href={`/${type === "movie" ? "movies" : "tv_series"}/${id}`}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl bg-gray-900">
        {/* Movie Poster */}
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImgSrc("/default_banner.jpg")}
        />

        {/* Hover Overlay with slide animation */}
        <div
          className={`absolute inset-0 z-[9999] bg-[#1a1d29] transition-transform duration-500 ease-out ${
            isHovered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full p-6 flex flex-col">
            <h3 className="text-white font-bold text-lg mb-3 leading-tight">
              {title}
            </h3>

            <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
              <span>{year}</span>
              {duration && (
                <>
                  <span>•</span>
                  <span>{handleDuration(duration)}</span>
                </>
              )}
            </div>

            {/* Scrollable description */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-custom">
              {description && (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Fixed button at bottom */}
            <div onClick={(e) => e.preventDefault()}>
              <WatchlistButton
                movieId={id}
                contentId={contentId}
                type={type === "movie" ? "MOVIE" : "TVSERIES"}
                variant="default"
                size="default"
                className="w-full bg-transparent hover:bg-white/10 text-white border border-white/40 rounded-md py-3 transition-colors flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Default title overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          <h3 className="text-white font-bold text-sm line-clamp-1">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
