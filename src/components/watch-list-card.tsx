// components/MovieCard.tsx
"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";

interface WatchListCardProps {
  movie: {
    id: string; // Watchlist record ID
    contentId: string; // Movie/TVSeries ID (for navigation)
    movieContentId: string; // Content ID (for removal)
    type: string;
    title: string;
    image: string;
    genres: string[];
    year: string;
    duration: string;
    rating: string;
    youtubeTrailerUrl?: string;
    accessTier?: string;
  };
  isEditing: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export const WatchListCard = ({
  movie,
  isEditing,
  isSelected,
  onToggleSelect,
}: WatchListCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (isEditing) {
      onToggleSelect(movie.id);
    } else {
      if (movie.type === "TVSERIES") {
        // Navigate to TV series detail page using contentId
        router.push(`/tv_series/${movie.title}-${movie.contentId}`);
        return;
      }
      // Navigate to movie detail page using contentId (movie/tvseries ID)
      router.push(`/movies/${movie.contentId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer transition-transform duration-300 hover:-translate-y-2"
    >
      {/* Ảnh poster */}
      <div className="relative h-52 w-full overflow-hidden rounded-3xl">
        <img
          src={movie.image || "/default_banner.jpg"}
          alt={movie.title || "Movie poster"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default_banner.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Premium badge */}
        {isPremiumContent(movie.accessTier) && (
          <PremiumBadge
            size="sm"
            showLabel
            className="absolute top-2 right-2 z-10"
          />
        )}

        {/* Biểu tượng chọn khi edit */}
        {isEditing && (
          <div className="absolute top-4 right-4">
            {isSelected ? (
              <CheckCircle2 className="h-7 w-7 text-purple-400 drop-shadow-lg" />
            ) : (
              <Circle className="h-7 w-7 text-white/70 drop-shadow" />
            )}
          </div>
        )}
      </div>

      {/* Thông tin phim */}
      <div className="mt-5 space-y-2">
        <h3 className="text-lg font-semibold text-white group-hover:text-white">
          {movie.title}
        </h3>
        <p className="text-sm text-gray-400">{movie.genres.join(" • ")}</p>
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {movie.year} • {movie.duration} • {movie.rating}
        </p>
      </div>
    </div>
  );
};
