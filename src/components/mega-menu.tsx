"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useTrendingMovies } from "@/hooks/use-movies";

const MOVIES_PER_PAGE = 3;

export function MegaMenu() {
  const { categories, isLoading, error } = useCategories();
  const { result: trendingResult } = useTrendingMovies({ page: 1, limit: 12 });
  const movies = trendingResult?.data ?? [];

  const [movieOffset, setMovieOffset] = useState(0);
  const visibleMovies = movies.slice(movieOffset, movieOffset + MOVIES_PER_PAGE);
  const canGoPrev = movieOffset > 0;
  const canGoNext = movieOffset + MOVIES_PER_PAGE < movies.length;

  // Determine message based on state
  const message = isLoading
    ? "Loading..."
    : error
      ? "Error loading categories"
      : categories.length === 0
        ? "No categories available"
        : "";

  return (
    <div
      data-mega-menu
      className="w-max max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl p-6 grid grid-cols-[auto_auto_auto] gap-10"
    >
      {/* POPULAR */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-6 text-sm uppercase tracking-wide">
          Popular
        </h3>
        <ul className="space-y-3">
          {[
            { label: "All Movies", slug: "all" },
            { label: "Trending Now", slug: "trending" },
            { label: "New Releases", slug: "new-release" },
          ].map((item) => (
            <li key={item.slug}>
              <Link
                href={`/movies/type/${item.slug}`}
                className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* GENRES */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-6 text-sm uppercase tracking-wide">
          Genres
        </h3>
        <div>
          {message && <p className="text-red-500 mb-3">{message}</p>}
          <ul className="columns-2 gap-x-8 space-y-3">
            {categories.map((ct) => {
              const slug = ct.categoryName.toLowerCase().replace(/\s+/g, "-");
              const url = `/movies/type/category/${slug}-${ct.id}`;
              return (
                <li key={ct.id}>
                  <Link
                    href={url}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    {ct.categoryName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* MOVIES OF THE DAY */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Movies of the Day
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setMovieOffset((o) => Math.max(0, o - MOVIES_PER_PAGE))}
              disabled={!canGoPrev}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => canGoNext && setMovieOffset((o) => o + MOVIES_PER_PAGE)}
              disabled={!canGoNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 overflow-x-auto">
          {visibleMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.metaData.title}-${movie.id}`}
              className="flex-shrink-0 text-center"
            >
              <div className="w-28 h-40 rounded-lg overflow-hidden mb-2 shadow-md">
                <Image
                  src={movie.metaData.thumbnail || "/placeholder.svg"}
                  alt={movie.metaData.title}
                  width={112}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-700 font-medium leading-tight max-w-[112px]">
                {movie.metaData.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
