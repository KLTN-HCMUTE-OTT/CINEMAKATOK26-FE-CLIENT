/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { recommendationsControllerGetRecommendations } from "@/apis/api/recommendations";
import { queryKeys } from "@/lib/query-keys";

const RECOMMENDATIONS_STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface UseRecommendationsResult {
  result: API.RecommendationResponseDataDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecommendations(
  params?: API.RecommendationsControllerGetRecommendationsParams,
  enabled: boolean = true
): UseRecommendationsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.recommendations.list(params as any),
    queryFn: async () => {
      const response = await recommendationsControllerGetRecommendations(params || {});
      return response.data?.data ?? null;
    },
    staleTime: RECOMMENDATIONS_STALE_TIME,
    enabled: enabled,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
