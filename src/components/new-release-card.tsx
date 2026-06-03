"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";

interface ReleaseCardProps {
  movie: API.MovieDto;
}

export function ReleaseCard({ movie }: ReleaseCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    movie.metaData.thumbnail || "/default_banner.jpg"
  );
  return (
    <div
      onClick={() => router.push(`/movies/${movie.metaData.title}-${movie.id}`)}
      className="flex-shrink-0 w-64 group cursor-pointer"
    >
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
        <Image
          src={imgSrc}
          alt={movie.metaData.title || "Movie poster"}
          fill
          className="object-cover"
          sizes="320px"
          priority={false}
          onError={() => setImgSrc("/default_banner.jpg")}
        />
        {/* Premium badge */}
        {isPremiumContent(movie.metaData.accessTier) && (
          <PremiumBadge
            size="sm"
            showLabel
            className="absolute top-2 right-2 z-10"
          />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-white font-semibold text-lg group-hover:text-orange-400 transition-colors">
          {movie.metaData.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>{movie.metaData.releaseDate}</span>
          <span>•</span>
          <span>{movie.duration}</span>
          <span>•</span>
          <span>{movie.metaData.imdbRating}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {movie.metaData.categories.map((genre, index) => (
            <span key={index} className="text-gray-400 text-sm">
              {genre.categoryName}
              {index < movie.metaData.categories.length - 1 && " • "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
