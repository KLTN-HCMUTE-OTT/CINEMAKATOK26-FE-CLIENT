/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  episodeReviewControllerGetReviewForEpisode,
  episodeReviewControllerCreateReview,
  episodeReviewControllerUpdateReview,
  episodeReviewControllerDeleteReview,
} from "@/apis/api/episodeReviews";
import { toast } from "sonner";
import { useUIStore, useAuthStore } from "@/store";
import { isAuthenticated } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import { useState } from "react";

const REVIEWS_PER_PAGE = 10;

/**
 * Query hook for fetching the current user's own review for this episode
 */
export function useMyEpisodeReviewQuery(episodeId: string) {
  return useQuery({
    queryKey: queryKeys.episodeReviews.userReview(
      episodeId,
      useAuthStore.getState().user?.id,
    ),
    queryFn: async () => {
      if (!isAuthenticated()) return null;
      const currentUserId = useAuthStore.getState().user?.id;
      if (!currentUserId) return null;
      const response = await episodeReviewControllerGetReviewForEpisode({
        episodeId,
        userId: currentUserId,
        limit: 1,
        page: 1,
      } as any);
      const reviews = response?.data?.data || [];
      return (reviews[0] as API.EpisodeReviewDto) ?? null;
    },
    enabled: !!episodeId && isAuthenticated(),
    staleTime: 30 * 1000,
  });
}

/**
 * Query hook for fetching episode reviews
 */
export function useEpisodeReviewsQuery(
  episodeId: string,
  page: number = 1,
  sortOrder: "newest" | "oldest" = "newest",
) {
  return useQuery({
    queryKey: [
      ...queryKeys.episodeReviews.forEpisode(episodeId, page),
      sortOrder,
    ] as const,
    queryFn: async () => {
      const response = await episodeReviewControllerGetReviewForEpisode({
        episodeId,
        page,
        limit: REVIEWS_PER_PAGE,
        sort: JSON.stringify({
          createdAt: sortOrder === "newest" ? "DESC" : "ASC",
        }),
      });

      const reviews = response?.data?.data || [];
      const meta = response?.data?.meta;

      // Find user's review if logged in
      let userReview: API.EpisodeReviewDto | null = null;
      if (isAuthenticated()) {
        const currentUserId = useAuthStore.getState().user?.id;
        const myReview = reviews.find(
          (r: any) => r.userId === currentUserId,
        ) ?? null;
        userReview = myReview;
      }

      return {
        reviews,
        userReview,
        currentPage: meta?.currentPage || page,
        totalPages: meta?.totalPages || 1,
        totalReviews: meta?.totalItems || reviews.length,
        hasMore: meta ? meta.currentPage < meta.totalPages : false,
      };
    },
    enabled: !!episodeId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation hook for submitting/updating episode review
 */
export function useSubmitEpisodeReviewMutation(episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      comment,
      userReviewId,
    }: {
      comment: string;
      userReviewId?: string;
    }) => {
      if (userReviewId) {
        await episodeReviewControllerUpdateReview(
          { id: userReviewId },
          { episodeId, contentReviewed: comment } as any,
        );
      } else {
        await episodeReviewControllerCreateReview({
          episodeId,
          contentReviewed: comment,
        } as any);
      }
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.userReviewId
          ? "Update comment successfully"
          : "Comment submitted successfully",
      );
      queryClient.invalidateQueries({
        queryKey: ["episodeReviews", "episode", episodeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["episodeReviews", "userReview", episodeId],
      });
    },
    onError: (err: any) => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        useUIStore.getState().openLoginModal();
        toast.error("Please login to comment!");
      } else if (err?.response?.data?.message?.includes("already reviewed")) {
        toast.error("You have already reviewed this episode!");
      } else {
        toast.error("An error occurred. Please try again!");
      }
    },
  });
}

/**
 * Mutation hook for deleting episode review
 */
export function useDeleteEpisodeReviewMutation(episodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await episodeReviewControllerDeleteReview({ id: reviewId });
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["episodeReviews", "episode", episodeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["episodeReviews", "userReview", episodeId],
      });
    },
    onError: (err: any) => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        useUIStore.getState().openLoginModal();
      } else {
        toast.error("An error occurred. Please try again!");
      }
    },
  });
}

/**
 * Convenience hook that mirrors the old EpisodeReviewContext API
 * so consumer components don't need major rewrites.
 */
export function useEpisodeReview(episodeId: string) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const queryClient = useQueryClient();

  const reviewsQuery = useEpisodeReviewsQuery(episodeId, 1, sortOrder);
  const myReviewQuery = useMyEpisodeReviewQuery(episodeId);
  const submitMutation = useSubmitEpisodeReviewMutation(episodeId);
  const deleteMutation = useDeleteEpisodeReviewMutation(episodeId);

  return {
    userReview: myReviewQuery.data ?? null,
    allReviews: reviewsQuery.data?.reviews ?? [],
    reviewsLoading: reviewsQuery.isLoading,
    currentPage: reviewsQuery.data?.currentPage ?? 1,
    totalPages: reviewsQuery.data?.totalPages ?? 1,
    totalReviews: reviewsQuery.data?.totalReviews ?? 0,
    hasMore: reviewsQuery.data?.hasMore ?? false,
    sortOrder,
    setSortOrder,
    submitReview: async (comment: string) => {
      if (!isAuthenticated()) {
        useUIStore.getState().openLoginModal();
        toast.error("Please login to comment!");
        return;
      }
      const userReviewId = myReviewQuery.data?.id;
      await submitMutation.mutateAsync({ comment, userReviewId });
    },
    deleteReview: async (reviewId: string) => {
      if (!isAuthenticated()) {
        useUIStore.getState().openLoginModal();
        return;
      }
      await deleteMutation.mutateAsync(reviewId);
    },
    refetchReviews: () => reviewsQuery.refetch(),
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
  };
}
