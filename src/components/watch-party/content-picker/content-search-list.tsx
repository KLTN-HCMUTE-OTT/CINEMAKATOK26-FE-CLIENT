"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Search, Star, AlertCircle, Loader2, VideoOff } from "lucide-react";
import { moviesControllerGetMovies } from "@/apis/api/movies";
import { tvSeriesControllerGetTvSeries } from "@/apis/api/tvSeries";
import type { ContentType } from "./content-type-tabs";
import { extractVideoId } from "@/lib/content-video-resolver";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";

interface ContentSearchListProps {
  contentType: ContentType;
  onPickMovie: (movie: API.MovieDto) => void;
  onPickSeries: (series: API.TVSeriesSummaryDto) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function ContentSearchList({
  contentType,
  onPickMovie,
  onPickSeries,
}: ContentSearchListProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, [contentType]);

  const moviesQuery = useQuery({
    queryKey: ["content-picker", "movies", debouncedSearch],
    queryFn: async () => {
      const res = await moviesControllerGetMovies({
        search: debouncedSearch ? JSON.stringify({ title: debouncedSearch }) : undefined,
        limit: 20,
        page: 1,
      });
      return res.data?.data ?? [];
    },
    enabled: contentType === "movie",
    staleTime: 30_000,
  });

  const seriesQuery = useQuery({
    queryKey: ["content-picker", "tv", debouncedSearch],
    queryFn: async () => {
      const res = await tvSeriesControllerGetTvSeries({
        search: debouncedSearch || undefined,
        limit: 20,
        page: 1,
      });
      return res.data?.data ?? [];
    },
    enabled: contentType === "tv",
    staleTime: 30_000,
  });

  const { data, isLoading, error, refetch } =
    contentType === "movie" ? moviesQuery : seriesQuery;

  const items = (data ?? []) as (API.MovieDto | API.TVSeriesSummaryDto)[];

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-3 border-b border-white/8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              contentType === "movie"
                ? "Search movies…"
                : "Search TV series…"
            }
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
            <AlertCircle className="w-8 h-8 text-red-400/60" />
            <p className="text-sm text-red-400">Failed to load results</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-600">
            <Search className="w-8 h-8 opacity-30" />
            <p className="text-sm">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : contentType === "movie"
                ? "Search for a movie to get started"
                : "Search for a TV series to get started"}
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          items.map((item) => {
            const isMovie = "duration" in item;

            if (isMovie) {
              const movie = item as API.MovieDto;
              const { videoId } = extractVideoId(movie);
              const noVideo = !videoId;
              return (
                <MovieRow
                  key={movie.id}
                  movie={movie}
                  noVideo={noVideo}
                  onPick={onPickMovie}
                />
              );
            }

            const series = item as API.TVSeriesSummaryDto;
            return (
              <SeriesRow key={series.id} series={series} onPick={onPickSeries} />
            );
          })}
      </div>
    </div>
  );
}

function MovieRow({
  movie,
  noVideo,
  onPick,
}: {
  movie: API.MovieDto;
  noVideo: boolean;
  onPick: (m: API.MovieDto) => void;
}) {
  const year = movie.metaData.releaseDate
    ? new Date(movie.metaData.releaseDate).getFullYear()
    : null;

  return (
    <button
      disabled={noVideo}
      onClick={() => !noVideo && onPick(movie)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-white/5 last:border-0 ${
        noVideo
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/5 cursor-pointer"
      }`}
      title={noVideo ? "Video not available yet" : undefined}
    >
      <div className="flex-none relative w-10 h-14 rounded overflow-hidden bg-gray-800">
        {movie.metaData.thumbnail ? (
          <Image
            src={movie.metaData.thumbnail}
            alt={movie.metaData.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff className="w-4 h-4 text-gray-600" />
          </div>
        )}
        {isPremiumContent(movie.metaData.accessTier) && (
          <PremiumBadge size="sm" className="absolute top-0.5 left-0.5 !px-1 !py-0.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {movie.metaData.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <span className="text-xs text-gray-500">{year}</span>}
          {movie.metaData.avgRating != null && movie.metaData.avgRating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              {movie.metaData.avgRating.toFixed(1)}
            </span>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-medium">
            Movie
          </span>
          {isPremiumContent(movie.metaData.accessTier) && (
            <PremiumBadge size="sm" showLabel />
          )}
          {noVideo && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SeriesRow({
  series,
  onPick,
}: {
  series: API.TVSeriesSummaryDto;
  onPick: (s: API.TVSeriesSummaryDto) => void;
}) {
  const year = series.metaData.releaseDate
    ? new Date(series.metaData.releaseDate).getFullYear()
    : null;

  return (
    <button
      onClick={() => onPick(series)}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
    >
      <div className="flex-none relative w-10 h-14 rounded overflow-hidden bg-gray-800">
        {series.metaData.thumbnail ? (
          <Image
            src={series.metaData.thumbnail}
            alt={series.metaData.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff className="w-4 h-4 text-gray-600" />
          </div>
        )}
        {isPremiumContent(series.metaData.accessTier) && (
          <PremiumBadge size="sm" className="absolute top-0.5 left-0.5 !px-1 !py-0.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {series.metaData.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <span className="text-xs text-gray-500">{year}</span>}
          {series.metaData.avgRating != null &&
            series.metaData.avgRating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                {series.metaData.avgRating.toFixed(1)}
              </span>
            )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium">
            TV Series
          </span>
          {isPremiumContent(series.metaData.accessTier) && (
            <PremiumBadge size="sm" showLabel />
          )}
          <span className="text-xs text-gray-600">
            {series.totalSeasons} season{series.totalSeasons !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </button>
  );
}
