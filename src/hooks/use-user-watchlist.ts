"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  watchListControllerGetUserWatchList,
  watchListControllerRemoveFromWatchList,
} from "@/apis/api/watchList";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

interface WatchlistItem {
  id: string;
  createdAt: string;
  updatedAt?: string;
  content: {
    id: string;
    contentId: string;
    title: string;
    type: "MOVIE" | "TVSERIES";
    thumbnail?: string;
    description?: string;
    releaseDate?: string;
    maturityRating?: string;
    trailer?: string;
    duration?: number;
    categories?: string[] | Array<{ id: string; name: string }>;
  };
}

// Transformed data for WatchListCard component
export interface WatchlistCardData {
  id: string;
  contentId: string;
  movieContentId: string;
  type: string;
  title: string;
  image: string;
  genres: string[];
  year: string;
  duration: string;
  rating: string;
  youtubeTrailerUrl?: string;
}

interface UseUserWatchlistOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

// Transform WatchlistItem to WatchlistCardData
function transformWatchlistItem(item: WatchlistItem): WatchlistCardData {
  const { content, id } = item;

  const year = content.releaseDate
    ? new Date(content.releaseDate).getFullYear().toString()
    : "N/A";

  const duration = content.duration
    ? `${Math.floor(content.duration / 60)} hr ${content.duration % 60} mins`
    : "N/A";

  let genres: string[] = [];
  if (content.categories) {
    if (Array.isArray(content.categories)) {
      if (typeof content.categories[0] === "string") {
        genres = content.categories as string[];
      } else {
        genres = (
          content.categories as Array<{ id: string; name: string }>
        ).map((cat) => cat.name);
      }
    }
  }

  const image = content.thumbnail
    ? content.thumbnail.startsWith("http")
      ? content.thumbnail
      : `https://image.tmdb.org/t/p/w500${content.thumbnail}`
    : "/default_banner.jpg";

  const rating = content.maturityRating || "NR";

  return {
    id,
    contentId: content.id,
    movieContentId: content.contentId,
    type: content.type,
    title: content.title,
    image,
    genres,
    year,
    duration,
    rating,
    youtubeTrailerUrl: content.trailer,
  };
}

/**
 * Hook to fetch and manage user's watchlist
 */
export function useUserWatchlist(options: UseUserWatchlistOptions = {}) {
  const { page = 1, limit = 100, autoFetch = true } = options;
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery({
    queryKey: [...queryKeys.watchlist.all, "user", page, limit] as const,
    queryFn: async () => {
      const response = await watchListControllerGetUserWatchList({
        page,
        limit,
      });

      const data = response.data?.data || response.data;
      let items: WatchlistItem[] = [];
      let totalItems = 0;
      let totalPages = 0;

      if (Array.isArray(data)) {
        items = data;
        totalItems = data.length;
      } else if (data?.items && Array.isArray(data.items)) {
        items = data.items;
        totalItems = data.total || data.items.length;
        totalPages = data.totalPages || Math.ceil((data.total || 0) / limit);
      }

      return {
        items,
        transformedItems: items.map(transformWatchlistItem),
        totalItems,
        totalPages,
      };
    },
    enabled: autoFetch,
    staleTime: 30 * 1000,
  });

  // Remove single item mutation
  const removeMutation = useMutation({
    mutationFn: async (movieContentId: string) => {
      await watchListControllerRemoveFromWatchList({
        contentId: movieContentId,
      });
      return movieContentId;
    },
    onSuccess: () => {
      toast.success("Removed from watchlist");
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message || "Failed to remove from watchlist";
      toast.error(errorMessage);
    },
  });

  // Remove multiple items mutation
  const removeMultipleMutation = useMutation({
    mutationFn: async (movieContentIds: string[]) => {
      await Promise.all(
        movieContentIds.map((movieContentId) =>
          watchListControllerRemoveFromWatchList({ contentId: movieContentId }),
        ),
      );
      return movieContentIds;
    },
    onSuccess: (_data, movieContentIds) => {
      toast.success(
        `Removed ${movieContentIds.length} item(s) from watchlist`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message || "Failed to remove items";
      toast.error(errorMessage);
    },
  });

  return {
    watchlist: watchlistQuery.data?.transformedItems ?? [],
    rawWatchlist: watchlistQuery.data?.items ?? [],
    isLoading: watchlistQuery.isLoading,
    isDeleting: removeMutation.isPending || removeMultipleMutation.isPending,
    error: watchlistQuery.error?.message ?? null,
    totalItems: watchlistQuery.data?.totalItems ?? 0,
    totalPages: watchlistQuery.data?.totalPages ?? 0,
    refetch: watchlistQuery.refetch,
    removeFromWatchlist: removeMutation.mutateAsync,
    removeMultipleFromWatchlist: removeMultipleMutation.mutateAsync,
  };
}
