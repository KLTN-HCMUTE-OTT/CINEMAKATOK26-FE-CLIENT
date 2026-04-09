/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  tvSeriesControllerGetTvSeries,
  tvSeriesControllerGetTvSeriesById,
  tvSeriesControllerGetTrendingTvSeries,
  tvSeriesControllerGetTvSeriesByCategory,
} from "@/apis/api/tvSeries";
import { toast } from "sonner";

interface UseTvSeriesListResult {
  result: API.TVSeriesSummaryDtoPaginatedResponseDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseTvSeriesDetailResult {
  result: API.TVSeriesDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_LIST_ERROR = "Không thể tải danh sách TV Series";
const DEFAULT_DETAIL_ERROR = "Không thể tải thông tin TV Series";

type TVSeriesFetchFunction = (
  params: any,
) => Promise<{ data: API.TVSeriesSummaryDtoPaginatedResponseDto }>;

/**
 * Generic hook for fetching TV series
 */
function useTvSeriesFetch(
  fetchFn: TVSeriesFetchFunction,
  params: any,
  errorMessage: string,
): UseTvSeriesListResult {
  const [result, setResult] =
    useState<API.TVSeriesSummaryDtoPaginatedResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(params !== undefined);
  const [error, setError] = useState<string | null>(null);

  const paramsString = JSON.stringify(params);

  const fetchTvSeries = useCallback(async () => {
    //  Nếu params là undefined, không gọi API
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString, errorMessage, fetchFn]);

  useEffect(() => {
    fetchTvSeries();
  }, [fetchTvSeries]);

  return {
    result,
    isLoading,
    error,
    refetch: fetchTvSeries,
  };
}

/**
 * Hook to fetch all TV series
 */
export function useTvSeriesList(
  params?: API.TvSeriesControllerGetTvSeriesParams,
): UseTvSeriesListResult {
  return useTvSeriesFetch(
    tvSeriesControllerGetTvSeries,
    params,
    DEFAULT_LIST_ERROR,
  );
}

/**
 * Hook to fetch trending TV series
 */
export function useTVSeriesTrending(
  params?: API.TvSeriesControllerGetTrendingTvSeriesParams,
): UseTvSeriesListResult {
  return useTvSeriesFetch(
    tvSeriesControllerGetTrendingTvSeries,
    params,
    "Không thể tải TV Series đang thịnh hành",
  );
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
  // Chỉ tạo object fetchParams nếu params đầu vào không phải là undefined
  const fetchParams:
    | API.TvSeriesControllerGetTvSeriesByCategoryParams
    | undefined = params === undefined ? undefined : { ...params, categoryId };

  return useTvSeriesFetch(
    tvSeriesControllerGetTvSeriesByCategory,
    fetchParams, // Truyền fetchParams đã được kiểm tra
    "Không thể tải TV Series theo thể loại",
  );
}

/**
 * Hook to fetch TV series detail
 */
export function useTvSeriesDetail(id?: string): UseTvSeriesDetailResult {
  const [result, setResult] = useState<API.TVSeriesDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await tvSeriesControllerGetTvSeriesById({ id });

      if (response?.data?.data) {
        setResult(response.data.data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : DEFAULT_DETAIL_ERROR;
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    result,
    isLoading,
    error,
    refetch: fetchDetail,
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
  const params = useMemo(
    () => ({ page, limit, sort, search, filter }),
    [page, limit, sort, search, filter],
  );

  // Gọi tất cả hook cùng thứ tự
  const allTvSeries = useTvSeriesList(type === "all" ? params : undefined);
  const trendingTvSeries = useTVSeriesTrending(
    type === "trending" ? params : undefined,
  );
  const categoryTvSeries = useTvSeriesByCategory(
    categoryId ?? "",
    type === "category" && categoryId ? params : undefined,
  );

  // Chọn kết quả theo type
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
        refetch: async () => {},
      };
  }
}

export function useTvSeriesFindOne(tvSeriesId?: string) {
  const [result, setResult] = useState<API.TVSeriesDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchContentId = async () => {
      if (!tvSeriesId) return;

      try {
        const response = await tvSeriesControllerGetTvSeriesById({
          id: tvSeriesId,
        });
        if (response?.data?.data) {
          setResult(response.data.data);
        }
        setIsLoading(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error fetching TV series detail";
        setError(message);
        console.error("Error fetching contentId:", err);
      }
    };
    fetchContentId();
  }, [tvSeriesId]);
  return { result, isLoading, error };
}
