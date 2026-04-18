"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesControllerGetCategories } from "@/apis/api/categories";
import { queryKeys } from "@/lib/query-keys";

interface UseCategoriesResult {
  categories: API.CategoryDto[];
  isLoading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const response = await categoriesControllerGetCategories({
        page: 1,
        limit: 100,
      });
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — categories rarely change
  });

  return {
    categories: data ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}
