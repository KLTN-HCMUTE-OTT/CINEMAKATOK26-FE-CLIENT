"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

export function MegaMenu() {
  const movies = [
    { title: "John Wick 4", image: "/john-wick-4-movie-poster.jpg" },
    { title: "Spider Man Memo", image: "/spider-man-movie-poster.jpg" },
    { title: "The White House", image: "/white-house-down-movie-poster.jpg" },
  ];

  const { categories, isLoading, error } = useCategories();

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
      className="w-screen max-w-6xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl p-8 grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-8"
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
            { label: "Recommend", slug: "recommend" },
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

      {/* COLLECTIONS */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-6 text-sm uppercase tracking-wide">
          Collections
        </h3>
        <ul className="space-y-3">
          {[
            "Actor’s Spotlight",
            "Holiday Movies",
            "New Trailers",
            "Weekly Watchlist",
            "TV Networks",
          ].map((item) => (
            <li key={item}>
              <a
                href="#"
                className="text-gray-600 hover:text-purple-600 transition-colors text-sm"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* MOVIES OF THE DAY */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Movies of the Day
          </h3>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 overflow-x-auto">
          {movies.map((movie) => (
            <div key={movie.title} className="flex-shrink-0 text-center">
              <div className="w-28 h-40 rounded-lg overflow-hidden mb-2 shadow-md">
                <Image
                  src={movie.image || "/placeholder.svg"}
                  alt={movie.title}
                  width={112}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-700 font-medium leading-tight max-w-[112px]">
                {movie.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
