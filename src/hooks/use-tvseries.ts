/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  tvSeriesControllerGetTvSeries,
  tvSeriesControllerGetTvSeriesById,
  tvSeriesControllerGetTrendingTvSeries,
  tvSeriesControllerGetTvSeriesByCategory,
} from "@/apis/api/tvSeries";
import { queryKeys } from "@/lib/query-keys";

const TV_STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface UseTvSeriesListResult {
  result: API.TVSeriesSummaryDtoPaginatedResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseTvSeriesDetailResult {
  result: API.TVSeriesDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch all TV series
 */
export function useTvSeriesList(
  params?: API.TvSeriesControllerGetTvSeriesParams,
): UseTvSeriesListResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tvSeries.list({ type: "all", ...params }),
    queryFn: async () => {
      const response = await tvSeriesControllerGetTvSeries(params!);
      return response.data;
    },
    staleTime: TV_STALE_TIME,
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
 * Hook to fetch trending TV series
 */
export function useTVSeriesTrending(
  params?: API.TvSeriesControllerGetTrendingTvSeriesParams,
): UseTvSeriesListResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tvSeries.list({ type: "trending", ...params }),
    queryFn: async () => {
      const response = await tvSeriesControllerGetTrendingTvSeries(params!);
      return response.data;
    },
    staleTime: TV_STALE_TIME,
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
 * Hook to fetch tv series by category
 */
export function useTvSeriesByCategory(
  categoryId: string,
  params?: Omit<
    API.TvSeriesControllerGetTvSeriesByCategoryParams,
    "categoryId"
  >,
): UseTvSeriesListResult {
  const fetchParams:
    | API.TvSeriesControllerGetTvSeriesByCategoryParams
    | undefined = params === undefined ? undefined : { ...params, categoryId };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tvSeries.list({
      type: "category",
      categoryId,
      ...params,
    }),
    queryFn: async () => {
      const response = await tvSeriesControllerGetTvSeriesByCategory(
        fetchParams!,
      );
      return response.data;
    },
    staleTime: TV_STALE_TIME,
    enabled: fetchParams !== undefined,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch TV series detail
 */
export function useTvSeriesDetail(id?: string): UseTvSeriesDetailResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tvSeries.detail(id ?? ""),
    queryFn: async () => {
      const response = await tvSeriesControllerGetTvSeriesById({ id: id! });
      return response?.data?.data ?? null;
    },
    staleTime: TV_STALE_TIME,
    enabled: !!id,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * Hook to fetch TV series data based on type
 */
interface UseTvSeriesDataParams {
  type: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filter?: string;
}

export function useTvSeriesData({
  type,
  categoryId,
  page,
  limit,
  sort,
  search,
  filter,
}: UseTvSeriesDataParams): UseTvSeriesListResult {
  const params = { page, limit, sort, search, filter };

  const allTvSeries = useTvSeriesList(type === "all" ? params : undefined);
  const trendingTvSeries = useTVSeriesTrending(
    type === "trending" ? params : undefined,
  );
  const categoryTvSeries = useTvSeriesByCategory(
    categoryId ?? "",
    type === "category" && categoryId ? params : undefined,
  );

  switch (type) {
    case "all":
      return allTvSeries;
    case "trending":
      return trendingTvSeries;
    case "category":
      return categoryTvSeries;
    default:
      return {
        result: null,
        isLoading: false,
        error: "Invalid TV series type",
        refetch: () => {},
      };
  }
}

/**
 * Hook to fetch a single TV series by ID (alias for useTvSeriesDetail)
 */
export function useTvSeriesFindOne(tvSeriesId?: string) {
  const { result, isLoading, error } = useTvSeriesDetail(tvSeriesId);
  return { result, isLoading, error };
}
