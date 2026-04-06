"use client";
import { Play } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";
import Image from "next/image";
import { useMovieData } from "@/hooks/use-movies";
import { LoadingErrorWrapper } from "./loading-error-wrapper";
import { handleDuration } from "./expanding-movie-card";
import Link from "next/link";
import { WatchlistButton } from "@/components/watchlist-button";

export function MovieDetailHero() {
  const { result, isLoading, error } = useMovieData({
    type: "new-release",
    page: 1,
    limit: 1,
  });
  const movie = result?.data[0];

  return (
    <div>
      {/* Content Container */}
      <div className="relative z-10 flex items-center mt-0">
        <LoadingErrorWrapper isLoading={isLoading} error={error}>
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 max-w-7xl">
              {/* Movie Poster */}
              <div className="flex-shrink-0">
                <div className="relative w-[22.5vw] lg:w-[22.5vw]">
                  <Image
                    src={movie?.metaData.thumbnail || "/placeholder.jpg"}
                    alt={movie?.metaData.title || "Movie Title"}
                    width={320}
                    height={480}
                    className="w-full rounded-lg shadow-2xl"
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="flex-1 max-w-3xl">
                {/* Title */}
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                  {movie?.metaData.title || "Movie Title"}
                </h1>

                {/* Movie Meta Info */}
                <div className="flex items-center gap-4 text-white text-base mb-6">
                  <span className="font-medium">
                    {movie?.metaData.releaseDate || "Year"}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="font-medium">
                    {handleDuration(movie?.duration || 0)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="bg-gray-700 px-3 py-1 rounded text-sm font-medium">
                    {movie?.metaData.maturityRating || "Age Rating"}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex items-center gap-3 mb-8">
                  {movie?.metaData.categories.map((genre, index) => (
                    <React.Fragment key={genre.id}>
                      <span className="text-white text-base">
                        {genre.categoryName}
                      </span>
                      {index < movie?.metaData.categories.length - 1 && (
                        <span className="text-gray-500">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl">
                  {movie?.metaData.description}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 rounded-full text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    <Link
                      href={`/movies/${movie?.metaData.title}-${movie?.id}`}
                    >
                      Play Now
                    </Link>
                  </Button>

                  <WatchlistButton
                    movieId={movie?.id.toString() || ""}
                    contentId={movie?.id.toString() || ""}
                    type="MOVIE"
                    variant="icon"
                    size="lg"
                    className="bg-slate-800/80 hover:bg-slate-700/80 text-white shadow-lg transition-all duration-300 hover:scale-105 w-14 h-14"
                  />
                </div>
              </div>
            </div>
          </div>
        </LoadingErrorWrapper>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}
