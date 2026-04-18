/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState } from "react";
import {
  useEpisodeReviewsQuery,
  useSubmitEpisodeReviewMutation,
  useDeleteEpisodeReviewMutation,
} from "@/hooks/use-episode-reviews";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUIStore } from "@/store";
import { isAuthenticated } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";

interface EpisodeReviewContextType {
  // Reviews
  userReview: API.EpisodeReviewDto | null;
  allReviews: API.EpisodeReviewDto[];
  reviewsLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  hasMore: boolean;
  sortOrder: "newest" | "oldest";
  setSortOrder: (order: "newest" | "oldest") => void;
  submitReview: (comment: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  refetchReviews: () => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

const EpisodeReviewContext = createContext<
  EpisodeReviewContextType | undefined
>(undefined);

interface EpisodeReviewProviderProps {
  children: React.ReactNode;
  episodeId: string;
}

export function EpisodeReviewProvider({
  children,
  episodeId,
}: EpisodeReviewProviderProps) {
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Reviews — TanStack Query
  const reviewsQuery = useEpisodeReviewsQuery(episodeId, 1, sortOrder);
  const submitMutation = useSubmitEpisodeReviewMutation(episodeId);
  const deleteMutation = useDeleteEpisodeReviewMutation(episodeId);

  const allReviews = reviewsQuery.data?.reviews ?? [];
  const userReview = reviewsQuery.data?.userReview ?? null;
  const currentPage = reviewsQuery.data?.currentPage ?? 1;
  const totalPages = reviewsQuery.data?.totalPages ?? 1;
  const totalReviews = reviewsQuery.data?.totalReviews ?? 0;
  const hasMore = reviewsQuery.data?.hasMore ?? false;

  const submitReview = async (comment: string) => {
    if (!isAuthenticated()) {
      openLoginModal();
      toast.error("Please login to comment!");
      return;
    }
    const userReviewId = userReview?.id;
    await submitMutation.mutateAsync({ comment, userReviewId });
  };

  const deleteReview = async (reviewId: string) => {
    if (!isAuthenticated()) {
      openLoginModal();
      return;
    }
    await deleteMutation.mutateAsync(reviewId);
  };

  return (
    <EpisodeReviewContext.Provider
      value={{
        userReview,
        allReviews,
        reviewsLoading: reviewsQuery.isLoading,
        currentPage,
        totalPages,
        totalReviews,
        hasMore,
        sortOrder,
        setSortOrder,
        submitReview,
        deleteReview,
        refetchReviews: async () => {
          await reviewsQuery.refetch();
        },
        loadMoreReviews: async () => {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.episodeReviews.forEpisode(episodeId),
          });
        },
        goToPage: async (_page: number) => {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.episodeReviews.forEpisode(episodeId),
          });
        },
      }}
    >
      {children}
    </EpisodeReviewContext.Provider>
  );
}

export function useEpisodeReview() {
  const context = useContext(EpisodeReviewContext);
  if (context === undefined) {
    throw new Error(
      "useEpisodeReview must be used within EpisodeReviewProvider",
    );
  }
  return context;
}
