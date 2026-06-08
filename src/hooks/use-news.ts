import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  newsControllerGetNews,
  newsControllerGetNewsById,
  newsControllerCreateNews,
  newsControllerUpdateNews,
  newsControllerDeleteNews,
  newsControllerGetRelatedNews,
} from "@/apis/api/news";
import { queryKeys } from "@/lib/query-keys";

// Get all news
export function useNews(params: API.NewsControllerGetNewsParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.blog.list(params.page),
    queryFn: async () => {
      const response = await newsControllerGetNews(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
  };
}

// Get featured news (first news)
export function useFeaturedNews() {
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.blog.all, "featured"] as const,
    queryFn: async () => {
      const response = await newsControllerGetNews({ page: 1, limit: 1 });
      return response.data.data[0] ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
  };
}

// Get news by ID
export function useNewsById(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.blog.detail(id),
    queryFn: async () => {
      const response = await newsControllerGetNewsById({ id });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
  };
}

// Get related news
export function useRelatedNews(
  id: string,
  params?: { page?: number; limit?: number },
) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.blog.detail(id), "related", params] as const,
    queryFn: async () => {
      const response = await newsControllerGetRelatedNews({
        newsId: id,
        page: params?.page || 1,
        limit: params?.limit || 6,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ?? null,
  };
}

// Create news (Admin)
export function useCreateNews() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newsData: API.CreateNewsBySessionDto) => {
      const response = await newsControllerCreateNews(newsData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all });
    },
  });

  return {
    createNews: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ?? null,
  };
}

// Update news (Admin)
export function useUpdateNews() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      newsData,
    }: {
      id: string;
      newsData: API.UpdateNewsDto;
    }) => {
      const response = await newsControllerUpdateNews({ id }, newsData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all });
    },
  });

  return {
    updateNews: (id: string, newsData: API.UpdateNewsDto) =>
      mutation.mutateAsync({ id, newsData }),
    isLoading: mutation.isPending,
    error: mutation.error ?? null,
  };
}

// Delete news (Admin)
export function useDeleteNews() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await newsControllerDeleteNews({ id });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.all });
    },
  });

  return {
    deleteNews: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ?? null,
  };
}
