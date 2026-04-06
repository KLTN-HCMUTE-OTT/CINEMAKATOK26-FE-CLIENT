"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  movieControllerFindAll,
  movieControllerGetTrendingMovies,
  movieControllerGetNewReleaseMovies,
  movieControllerGetMoviesByCategory,
  movieControllerGetRecommendationsByMovieId,
} from "@/apis/api/movie";
import { toast } from "sonner";

interface UseMoviesResult {
  result: API.MovieDtoPaginatedResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type MovieFetchFunction = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
) => Promise<{ data: API.MovieDtoPaginatedResponseDto }>;

/**
 * Generic hook for fetching movies
 * Reduces code duplication across different movie fetch operations
 */
function useMoviesFetch(
  fetchFn: MovieFetchFunction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any,
  errorMessage: string
): UseMoviesResult {
  const [result, setResult] = useState<API.MovieDtoPaginatedResponseDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //  FIX: Stringify params để so sánh stable
  const paramsString = JSON.stringify(params);

  const fetchMovies = useCallback(async () => {
    // Skip nếu params là undefined
    if (params === undefined) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFn(params);

      if (response?.data) {
        setResult(response.data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      toast.error(errorMsg);
      setError(errorMsg);
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
    //  FIX: Depend on paramsString instead of params object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString, errorMessage, fetchFn]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    result,
    isLoading,
    error,
    refetch: fetchMovies,
  };
}

/**
 * Hook to fetch all movies with pagination
 */
export function useAllMovies(
  params?: API.MovieControllerFindAllParams
): UseMoviesResult {
  return useMoviesFetch(
    movieControllerFindAll,
    params,
    "Không thể tải danh sách phim"
  );
}

/**
 * Hook to fetch trending movies
 */
export function useTrendingMovies(
  params?: API.MovieControllerGetTrendingMoviesParams
): UseMoviesResult {
  return useMoviesFetch(
    movieControllerGetTrendingMovies,
    params,
    "Không thể tải phim đang thịnh hành"
  );
}

/**
 * Hook to fetch new release movies
 */
export function useNewReleaseMovies(
  params?: API.MovieControllerGetNewReleaseMoviesParams
): UseMoviesResult {
  return useMoviesFetch(
    movieControllerGetNewReleaseMovies,
    params,
    "Không thể tải phim mới phát hành"
  );
}

/**
 * Hook to fetch movies by category
 */
export function useMoviesByCategory(
  categoryId: string,
  params?: Omit<API.MovieControllerGetMoviesByCategoryParams, "categoryId">
): UseMoviesResult {
  const fullParams: API.MovieControllerGetMoviesByCategoryParams | undefined =
    categoryId
      ? {
          categoryId,
          ...params,
        }
      : undefined;

  return useMoviesFetch(
    movieControllerGetMoviesByCategory,
    fullParams,
    "Không thể tải phim theo thể loại"
  );
}

export function useRecommendedMovies(
  params?: API.MovieControllerGetRecommendationsByMovieIdParams
): UseMoviesResult {
  return useMoviesFetch(
    movieControllerGetRecommendationsByMovieId,
    params,
    "Không thể tải phim gợi ý"
  );
}

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
  //  Memoize params để tránh recreate object
  const params = useMemo(
    () => ({ page, limit, sort, search }),
    [page, limit, sort, search]
  );

  //  Chỉ gọi hook tương ứng với type
  const allMovies = useAllMovies(type === "all" ? params : undefined);

  const trendingMovies = useTrendingMovies(
    type === "trending" ? params : undefined
  );

  const newReleaseMovies = useNewReleaseMovies(
    type === "new-release" ? params : undefined
  );

  const moviesByCategory = useMoviesByCategory(
    categoryId || "",
    type === "category" ? params : undefined
  );

  //  Return data dựa vào type
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
        refetch: async () => {},
      };
  }
}
