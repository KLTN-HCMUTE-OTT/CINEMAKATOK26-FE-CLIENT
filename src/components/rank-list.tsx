"use client";

import { useState, useEffect } from "react";
import { RankItem } from "./rank-item";
import { useMovieData } from "@/hooks/use-movies";
import { useTVSeriesTrending } from "@/hooks/use-tvseries";

interface Movie {
  id: string;
  poster: string;
  title: string;
  year: number;
  genres: string[];
}

interface RankListProps {
  title?: string;
  showFilterTabs?: boolean;
  type?: string; // "movies" | "tv_series"
}

export function RankList({
  title = "Top 10 this week",
  showFilterTabs = true,
  type = "movies",
}: RankListProps) {
  const [activeTab, setActiveTab] = useState<"movies" | "tv_series">("movies");

  //  Fix infinite re-render
  useEffect(() => {
    setActiveTab(type === "tv_series" ? "tv_series" : "movies");
  }, [type]);

  const { result, isLoading, error } = useMovieData({
    type: "all",
    page: 1,
    limit: 10,
    sort: JSON.stringify({ avgRating: "DESC" }),
  });

  const {
    result: tvResult,
    isLoading: tvLoading,
    error: tvError,
  } = useTVSeriesTrending({ page: 1, limit: 5 });

  const tvSeries: Movie[] =
    tvResult?.data.map((tv) => ({
      id: tv.id.toString(),
      poster: tv.metaData.thumbnail || "/placeholder.jpg",
      title: tv.metaData.title,
      year: new Date(tv.metaData.releaseDate).getFullYear(),
      genres: tv.metaData.categories.map((cat) => cat.categoryName),
    })) || [];

  const movies: Movie[] =
    result?.data.map((movie) => ({
      id: movie.id.toString(),
      poster: movie.metaData.thumbnail || "/placeholder.jpg",
      title: movie.metaData.title,
      year: new Date(movie.metaData.releaseDate).getFullYear(),
      genres: movie.metaData.categories.map((cat) => cat.categoryName),
    })) || [];

  const currentList = activeTab === "movies" ? movies : tvSeries;

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white">{title}</h2>

        {showFilterTabs && (
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("movies")}
              className={`text-lg font-semibold transition-colors ${
                activeTab === "movies"
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Movies
            </button>

            <button
              onClick={() => setActiveTab("tv_series")}
              className={`text-lg font-semibold transition-colors ${
                activeTab === "tv_series"
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              TV Series
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {currentList.slice(0, 10).map((movie, index) => (
          <RankItem
            key={movie.id}
            rank={index + 1}
            poster={movie.poster}
            year={movie.year}
            title={movie.title}
            genres={movie.genres}
            id={movie.id}
          />
        ))}
      </div>
    </div>
  );
}
