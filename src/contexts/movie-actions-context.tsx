/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFavoriteStatusQuery,
  useToggleFavoriteMutation,
} from "@/hooks/use-favorites";
import {
  useWatchlistStatusQuery,
  useToggleWatchlistMutation,
} from "@/hooks/use-watchlist";
import {
  useReviewsQuery,
  useSubmitReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/hooks/use-reviews-management";
import { toast } from "sonner";
import { useUIStore } from "@/store";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";

interface ActionsContextType {
  // Favorite
  isFavorite: boolean;
  totalFavorites: number;
  isFavoriteLoading: boolean;
  toggleFavorite: () => Promise<void>;

  // Watchlist
  isInWatchlist: boolean;
  isWatchlistLoading: boolean;
  toggleWatchlist: () => Promise<void>;

  // Reviews
  userReview: API.ReviewDto | null;
  allReviews: API.ReviewDto[];
  reviewsLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  hasMore: boolean;
  submitReview: (rating: number, review: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  refetchReviews: () => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;

  // Refetch functions
  refetchFavoriteStatus: () => Promise<void>;
  refetchWatchlistStatus: () => Promise<void>;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

interface ActionsProviderProps {
  children: React.ReactNode;
  contentId: string;
}

export function ActionsProvider({ children, contentId }: ActionsProviderProps) {
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const queryClient = useQueryClient();

  // Favorite — TanStack Query
  const favoriteQuery = useFavoriteStatusQuery(contentId);
  const favoriteMutation = useToggleFavoriteMutation(contentId);
  const isFavorite = favoriteQuery.data?.isFavorited ?? false;
  const totalFavorites = favoriteQuery.data?.totalFavorites ?? 0;

  // Watchlist — TanStack Query
  const watchlistQuery = useWatchlistStatusQuery(contentId);
  const watchlistMutation = useToggleWatchlistMutation(contentId);
  const isInWatchlist = watchlistQuery.data?.isInWatchList ?? false;

  // Reviews — TanStack Query
  const reviewsQuery = useReviewsQuery(contentId, 1);
  const submitMutation = useSubmitReviewMutation(contentId);
  const updateMutation = useUpdateReviewMutation(contentId);
  const deleteMutation = useDeleteReviewMutation(contentId);

  // Find user's review
  const allReviews = reviewsQuery.data?.reviews ?? [];
  let userReview: API.ReviewDto | null = null;
  if (isAuthenticated()) {
    const currentUserId = getCurrentUser()?.id;
    const myReview = allReviews.find(
      (r: API.ReviewDto) => r.userId === currentUserId,
    );
    if (myReview) userReview = myReview;
  }

  const toggleFavorite = async () => {
    if (!isAuthenticated()) {
      openLoginModal();
      return;
    }
    if (!contentId) {
      toast.error("Không tìm thấy thông tin nội dung");
      return;
    }
    await favoriteMutation.mutateAsync(isFavorite ? "remove" : "add");
  };

  const toggleWatchlist = async () => {
    if (!isAuthenticated()) {
      openLoginModal();
      return;
    }
    if (!contentId) {
      toast.error("Không tìm thấy thông tin phim");
      return;
    }
    await watchlistMutation.mutateAsync(isInWatchlist ? "remove" : "add");
  };

  const submitReview = async (rating: number, review: string) => {
    if (!isAuthenticated()) {
      openLoginModal();
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    if (userReview) {
      await updateMutation.mutateAsync({
        reviewId: userReview.id,
        rating,
        contentReviewed: review,
      });
    } else {
      await submitMutation.mutateAsync({ rating, contentReviewed: review });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!isAuthenticated()) {
      openLoginModal();
      return;
    }
    await deleteMutation.mutateAsync(reviewId);
  };

  const totalReviews = reviewsQuery.data?.totalReviews ?? 0;
  const hasMore = reviewsQuery.data?.hasMore ?? false;
  const meta = reviewsQuery.data?.meta;
  const currentPage = meta?.currentPage ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <ActionsContext.Provider
      value={{
        isFavorite,
        totalFavorites,
        isFavoriteLoading: favoriteMutation.isPending,
        toggleFavorite,
        isInWatchlist,
        isWatchlistLoading: watchlistMutation.isPending,
        toggleWatchlist,
        userReview,
        allReviews,
        reviewsLoading: reviewsQuery.isLoading,
        currentPage,
        totalPages,
        totalReviews,
        hasMore,
        submitReview,
        deleteReview,
        refetchReviews: async () => {
          await reviewsQuery.refetch();
        },
        loadMoreReviews: async () => {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.reviews.forContent(contentId),
          });
        },
        goToPage: async (_page: number) => {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.reviews.forContent(contentId),
          });
        },
        refetchFavoriteStatus: async () => {
          await favoriteQuery.refetch();
        },
        refetchWatchlistStatus: async () => {
          await watchlistQuery.refetch();
        },
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error("useActions must be used within ActionsProvider");
  }
  return context;
}
