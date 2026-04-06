"use client";
import { Eye, Play } from "lucide-react";
import { useState } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ButtonAction } from "@/components/ui/button-action";
import { DialogTrailer } from "@/components/dialog-trailer";
import { useRouter } from "next/navigation";
interface Props {
  id: string;
  title: string;
  description: string;
  genres: {
    id: string;
    categoryName: string;
  }[];
  year: string;
  seasons: number;
  episodeId: string;
  episodeTitle?: string;
  viewCount: number;
  bannerUrl: string;
  trailerUrl?: string;
  isFavorited: boolean;
  totalFavorites: number;
  isFavoriteLoading: boolean;
  handleFavoriteToggle: () => void;
  isInWatchlist: boolean;
  isWatchlistLoading: boolean;
  toggleWatchlist: () => void;
  // Share props
  shareTitle?: string;
  shareDescription?: string;
  shareUrl?: string;
  shareThumbnail?: string;
}

export default function TvSeriesBanner({
  id,
  title,
  description,
  genres,
  year,
  seasons,
  episodeId,
  episodeTitle,
  viewCount,
  isFavorited,
  totalFavorites,
  isFavoriteLoading,
  handleFavoriteToggle,
  isInWatchlist,
  isWatchlistLoading,
  toggleWatchlist,
  bannerUrl,
  trailerUrl,
  shareTitle,
  shareDescription,
  shareUrl,
  shareThumbnail,
}: Props) {
  const [trailerDialogOpen, setTrailerDialogOpen] = useState(false);
  const router = useRouter();
  const handleClickPlay = () => {
    // Implement play functionality here
    router.push(
      `/tv_series/${title}-${id}/episode/${episodeTitle}-${episodeId}`
    ); // Example redirect to a play page
  };

  return (
    <div
      className="relative flex items-center min-h-[630px] bg-gradient-to-r from-[#181826] via-[#181826cc] to-transparent"
      style={{
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#181826] via-[#181826cc] to-transparent z-0" />

      {/* Left Content */}
      <div className="relative z-10 flex flex-col justify-center px-16 py-12 max-w-xl text-white">
        <div className="mb-2 text-indigo-400 font-semibold uppercase tracking-wide">
          {seasons} SEASONS AVAILABLE
        </div>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="mb-6 text-sm opacity-80">{description}</p>
        <div className="mb-8 flex gap-4 text-base opacity-80">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/tv_series/type/category/${genre.categoryName}-${genre.id}`}
              className="hover:underline hover:text-purple-400"
            >
              {genre.categoryName}
            </Link>
          ))}
          <span>{year}</span>
        </div>
        <div className="flex gap-6 mb-8">
          <Button
            onClick={handleClickPlay}
            className="bg-gradient-to-r from-purple-600 to-indigo-500 px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg text-lg"
          >
            <Play />
            Play
          </Button>
          {trailerUrl && (
            <Button
              className="bg-gray-800 px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow text-lg"
              onClick={() => setTrailerDialogOpen(true)}
            >
              View Trailer
            </Button>
          )}
        </div>
        <div className="flex gap-8 items-center mt-6">
          <div className="flex items-center gap-2 text-gray-400 text-base">
            <Eye className="w-5 h-5" />
            <span>{viewCount} Views</span>
          </div>
          <ButtonAction
            isFavorited={isFavorited}
            isFavoriteLoading={isFavoriteLoading}
            handleFavoriteToggle={handleFavoriteToggle}
            totalFavorites={totalFavorites}
            isInWatchlist={isInWatchlist}
            isWatchlistLoading={isWatchlistLoading}
            toggleWatchlist={toggleWatchlist}
            shareTitle={shareTitle}
            shareDescription={shareDescription}
            shareUrl={shareUrl}
            shareThumbnail={shareThumbnail}
          />
        </div>
      </div>
      <DialogTrailer
        title={title}
        trailerUrl={trailerUrl || ""}
        trailerDialogOpen={trailerDialogOpen}
        setTrailerDialogOpen={setTrailerDialogOpen}
      />
    </div>
  );
}
