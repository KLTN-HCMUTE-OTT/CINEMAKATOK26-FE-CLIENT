"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingCarousel } from "@/components/trending-carousel";
import { PersonMovieCard } from "./person-movie-card";

interface Movie {
  id: string;
  contentId: string;
  title: string;
  year: number;
  duration?: string;
  image: string;
  description?: string;
  character?: string;
  job?: string;
  type: "movie" | "tv";
}

interface PersonFilmographyProps {
  movies?: Movie[];
  name: string;
}

export function PersonFilmography({
  movies = [],
  name,
}: PersonFilmographyProps) {
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const filteredMovies = movies.filter((movie) => {
    if (filter === "all") return true;
    return movie.type === filter;
  });

  // Sort movies by year (descending)
  const sortedMovies = [...filteredMovies].sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-6">
      {/* Known For Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Known for</h2>
        <TrendingCarousel
          items={movies}
          renderCard={(movie: Movie) => (
            <PersonMovieCard
              key={movie.id}
              id={movie.id}
              contentId={movie.contentId}
              title={movie.title}
              year={movie.year}
              duration={movie.duration}
              image={movie.image}
              description={movie.description}
              type={movie.type}
            />
          )}
          slidesToShow={5}
          className="py-10"
        />
      </div>

      {/* Full Filmography */}
      <div>
        {/* Filter Tabs */}
        <div className="flex gap-6 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter("tv")}
            className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${
              filter === "tv"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            TV SHOWS
          </button>
          <button
            onClick={() => setFilter("movie")}
            className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${
              filter === "movie"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            MOVIE
          </button>
        </div>

        {/* Movie List - Simple Format */}
        <div className="space-y-0">
          {sortedMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/${movie.type === "movie" ? "movies" : "tv-shows"}/${
                movie.id
              }`}
              className="flex items-center gap-8 py-6 px-4 border-b border-gray-800 hover:bg-gray-900/30 transition-colors group"
            >
              {/* Year */}
              <div className="w-16 flex-shrink-0">
                <span className="text-gray-400 font-medium">{movie.year}</span>
              </div>

              {/* Title and Role */}
              <div className="flex-1">
                <span className="text-white font-bold group-hover:text-purple-400 transition-colors">
                  {movie.title}
                </span>
                {(movie.character || movie.job) && (
                  <span className="text-gray-400 ml-2">
                    {movie.character
                      ? `as ${movie.character}`
                      : `job ${movie.job}`}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
