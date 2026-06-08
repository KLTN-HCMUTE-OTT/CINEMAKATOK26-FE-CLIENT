"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  favoriteControllerCreateFavorite,
  favoriteControllerRemoveFavorite,
  favoriteControllerGetFavoriteStatus,
} from "@/apis/api/favorites";
import {
  watchListControllerAddToWatchList,
  watchListControllerRemoveFromWatchList,
  watchListControllerCheckInWatchList,
} from "@/apis/api/watchList";
import {
  reviewControllerCreateReview,
  reviewControllerUpdateReview,
} from "@/apis/api/review";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { isAuthenticated } from "@/lib/auth";

interface UseVideoPlayerActionsProps {
  contentId?: string;
  movieId?: string;
  enabled?: boolean;
}

export function useVideoPlayerActions({
  contentId,
  movieId,
  enabled = true,
}: UseVideoPlayerActionsProps) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && !!contentId && isAuthenticated();

  // Favorite status query
  const favoriteQuery = useQuery({
    queryKey: queryKeys.favorites.status(contentId ?? ""),
    queryFn: async () => {
      const response = await favoriteControllerGetFavoriteStatus({
        contentId: contentId!,
      });
      return { isFavorited: response?.data?.data?.isFavorited || false };
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });

  // Watchlist status query
  const watchlistQuery = useQuery({
    queryKey: queryKeys.watchlist.status(contentId ?? ""),
    queryFn: async () => {
      const response = await watchListControllerCheckInWatchList({
        contentId: contentId!,
      });
      return { isInWatchList: response?.data?.data?.isInWatchList || false };
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      if (!contentId) throw new Error("Content information not found");
      if (isFavorite) {
        return favoriteControllerRemoveFavorite({ contentId });
      } else {
        return favoriteControllerCreateFavorite({ contentId });
      }
    },
    onMutate: async (isFavorite) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.favorites.status(contentId ?? ""),
      });
      const previous = queryClient.getQueryData(
        queryKeys.favorites.status(contentId ?? ""),
      );
      queryClient.setQueryData(queryKeys.favorites.status(contentId ?? ""), {
        isFavorited: !isFavorite,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.favorites.status(contentId ?? ""),
          context.previous,
        );
      }
      toast.error("Please log in to perform this action!");
    },
    onSuccess: (_data, isFavorite) => {
      toast.success(isFavorite ? "Unliked successfully" : "Liked successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });

  // Toggle watchlist mutation
  const toggleWatchlistMutation = useMutation({
    mutationFn: async (isInWatchlist: boolean) => {
      if (!contentId) throw new Error("Content information not found");
      if (isInWatchlist) {
        return watchListControllerRemoveFromWatchList({ contentId });
      } else {
        return watchListControllerAddToWatchList({ contentId });
      }
    },
    onMutate: async (isInWatchlist) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.watchlist.status(contentId ?? ""),
      });
      const previous = queryClient.getQueryData(
        queryKeys.watchlist.status(contentId ?? ""),
      );
      queryClient.setQueryData(queryKeys.watchlist.status(contentId ?? ""), {
        isInWatchList: !isInWatchlist,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.watchlist.status(contentId ?? ""),
          context.previous,
        );
      }
      toast.error("Please log in to perform this action!");
    },
    onSuccess: (_data, isInWatchlist) => {
      toast.success(
        isInWatchlist ? "Removed from watchlist" : "Added to watchlist",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
  });

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async ({
      rating,
      review,
      hasExistingReview,
      reviewId,
    }: {
      rating: number;
      review: string;
      hasExistingReview: boolean;
      reviewId?: string;
    }) => {
      if (!contentId) throw new Error("Content information not found");
      if (hasExistingReview && reviewId) {
        await reviewControllerUpdateReview(
          { id: reviewId },
          { id: reviewId, contentId, rating, contentReviewed: review } as any,
        );
      } else {
        const response = await reviewControllerCreateReview({
          contentId,
          rating,
          contentReviewed: review,
        } as any);
        return response?.data?.data;
      }
    },
    onSuccess: () => {
      toast.success("Submit review successfully");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.forContent(contentId ?? ""),
      });
    },
    onError: (err: any) => {
      if (err?.response?.data?.message?.includes("already reviewed")) {
        toast.error("You have already reviewed this content!");
      } else {
        toast.error("Please log in to submit a review!");
      }
    },
  });

  const isFavorite = favoriteQuery.data?.isFavorited ?? false;
  const isInWatchlist = watchlistQuery.data?.isInWatchList ?? false;

  return {
    // Favorite
    isFavorite,
    isFavoriteLoading: toggleFavoriteMutation.isPending,
    toggleFavorite: () => toggleFavoriteMutation.mutate(isFavorite),
    // Watchlist
    isInWatchlist,
    isWatchlistLoading: toggleWatchlistMutation.isPending,
    toggleWatchlist: () => toggleWatchlistMutation.mutate(isInWatchlist),
    // Rating
    currentRating: 0,
    currentReview: "",
    submitRating: (
      rating: number,
      review: string,
      hasExistingReview = false,
      reviewId?: string,
    ) =>
      submitRatingMutation.mutate({
        rating,
        review,
        hasExistingReview,
        reviewId,
      }),
  };
}
