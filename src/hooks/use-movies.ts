"use client";

import { useQuery } from "@tanstack/react-query";
import {
  moviesControllerGetMovies,
  moviesControllerGetTrendingMovies,
  moviesControllerGetNewReleaseMovies,
  moviesControllerGetMoviesByCategory,
  moviesControllerGetRecommendationsByMovieId,
} from "@/apis/api/movies";
import { queryKeys } from "@/lib/query-keys";

const MOVIES_STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface UseMoviesResult {
  result: API.MovieDtoPaginatedResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch all movies with pagination
 */
export function useAllMovies(
  params?: API.MoviesControllerGetMoviesParams,
): UseMoviesResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.movies.list({ type: "all", ...params }),
    queryFn: async () => {
      const response = await moviesControllerGetMovies(params!);
      return response.data;
    },
    staleTime: MOVIES_STALE_TIME,
    enabled: params !== undefined,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch trending movies
 */
export function useTrendingMovies(
  params?: API.MoviesControllerGetTrendingMoviesParams,
): UseMoviesResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.movies.list({ type: "trending", ...params }),
    queryFn: async () => {
      const response = await moviesControllerGetTrendingMovies(params!);
      return response.data;
    },
    staleTime: MOVIES_STALE_TIME,
    enabled: params !== undefined,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch new release movies
 */
export function useNewReleaseMovies(
  params?: API.MoviesControllerGetNewReleaseMoviesParams,
): UseMoviesResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.movies.list({ type: "new-release", ...params }),
    queryFn: async () => {
      const response = await moviesControllerGetNewReleaseMovies(params!);
      return response.data;
    },
    staleTime: MOVIES_STALE_TIME,
    enabled: params !== undefined,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch movies by category
 */
export function useMoviesByCategory(
  categoryId: string,
  params?: Omit<API.MoviesControllerGetMoviesByCategoryParams, "categoryId">,
): UseMoviesResult {
  const fullParams: API.MoviesControllerGetMoviesByCategoryParams | undefined =
    categoryId && params
      ? { categoryId, ...params }
      : undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.movies.list({ type: "category", categoryId, ...params }),
    queryFn: async () => {
      const response = await moviesControllerGetMoviesByCategory(fullParams!);
      return response.data;
    },
    staleTime: MOVIES_STALE_TIME,
    enabled: fullParams !== undefined,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch recommended movies
 */
export function useRecommendedMovies(
  params?: API.MoviesControllerGetRecommendationsByMovieIdParams,
): UseMoviesResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.movies.recommendations(params?.movieId ?? ""),
    queryFn: async () => {
      const response = await moviesControllerGetRecommendationsByMovieId(params!);
      return response.data;
    },
    staleTime: MOVIES_STALE_TIME,
    enabled: params !== undefined,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch movie data based on type
 */
interface UseMovieDataParams {
  type: string;
  categoryId?: string;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
}

export function useMovieData({
  type,
  categoryId,
  page,
  limit,
  sort,
  search,
}: UseMovieDataParams): UseMoviesResult {
  const params = { page, limit, sort, search };

  const allMovies = useAllMovies(type === "all" ? params : undefined);
  const trendingMovies = useTrendingMovies(
    type === "trending" ? params : undefined,
  );
  const newReleaseMovies = useNewReleaseMovies(
    type === "new-release" ? params : undefined,
  );
  const moviesByCategory = useMoviesByCategory(
    categoryId || "",
    type === "category" ? params : undefined,
  );

  switch (type) {
    case "all":
      return allMovies;
    case "trending":
      return trendingMovies;
    case "new-release":
      return newReleaseMovies;
    case "category":
      return moviesByCategory;
    default:
      return {
        result: null,
        isLoading: false,
        error: "Invalid movie type",
        refetch: () => {},
      };
  }
}
