"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewControllerCreateReview,
  reviewControllerGetReviewForContent,
  reviewControllerCheckReviewOwner,
  reviewControllerUpdateReview,
  reviewControllerDeleteReview,
} from "@/apis/api/review";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

interface UseReviewsManagementProps {
  contentId: string;
  userId?: string;
}

const REVIEWS_PER_PAGE = 25;

/**
 * Query hook for fetching reviews for a content item
 */
export function useReviewsQuery(contentId: string, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.reviews.forContent(contentId, page),
    queryFn: async () => {
      const { data } = await reviewControllerGetReviewForContent({
        contentId,
        page,
        limit: REVIEWS_PER_PAGE,
      });

      return {
        reviews: data?.data ?? [],
        meta: data?.meta ?? null,
        totalReviews: data?.meta?.totalItems ?? 0,
        hasMore: data?.meta
          ? data.meta.currentPage < data.meta.totalPages
          : false,
      };
    },
    enabled: !!contentId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation hook for creating a review
 */
export function useSubmitReviewMutation(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rating,
      contentReviewed,
    }: {
      rating: number;
      contentReviewed: string;
    }) => {
      const { data } = await reviewControllerCreateReview({
        contentId,
        rating,
        contentReviewed: contentReviewed.trim(),
      } as any);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Cảm ơn bạn đã đánh giá!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.forContent(contentId),
      });
    },
    onError: (err: any) => {
      toast.error(
        err instanceof Error ? err.message : "Không thể gửi đánh giá",
      );
    },
  });
}

/**
 * Mutation hook for updating a review
 */
export function useUpdateReviewMutation(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      contentReviewed,
    }: {
      reviewId: string;
      rating: number;
      contentReviewed: string;
    }) => {
      const { data } = await reviewControllerUpdateReview(
        { id: reviewId },
        {
          rating,
          contentReviewed: contentReviewed.trim(),
          contentId,
        } as any,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật đánh giá thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.forContent(contentId),
      });
    },
    onError: (err: any) => {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật đánh giá",
      );
    },
  });
}

/**
 * Mutation hook for deleting a review
 */
export function useDeleteReviewMutation(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await reviewControllerDeleteReview({ id: reviewId });
    },
    onSuccess: () => {
      toast.success("Xóa đánh giá thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.forContent(contentId),
      });
    },
    onError: (err: any) => {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa đánh giá",
      );
    },
  });
}

/**
 * Legacy-compatible hook preserving the original API
 */
export function useReviewsManagement({
  contentId,
  userId,
}: UseReviewsManagementProps) {
  const queryClient = useQueryClient();

  // Use page 1 by default; load more appends
  const reviewsQuery = useReviewsQuery(contentId, 1);
  const submitMutation = useSubmitReviewMutation(contentId);
  const updateMutation = useUpdateReviewMutation(contentId);
  const deleteMutation = useDeleteReviewMutation(contentId);

  // Check ownership for reviews
  const checkOwnershipForReviews = async (
    reviews: API.ReviewDto[],
  ): Promise<Record<string, boolean>> => {
    if (!userId || reviews.length === 0) return {};

    const reviewIds = reviews.map((r) => r.id);
    const ownershipResults = await Promise.allSettled(
      reviewIds.map((id) => reviewControllerCheckReviewOwner({ id })),
    );

    const ownershipMap: Record<string, boolean> = {};
    reviewIds.forEach((id, index) => {
      const result = ownershipResults[index];
      if (result.status === "fulfilled") {
        ownershipMap[id] = result.value?.data?.data?.isOwner || false;
      } else {
        ownershipMap[id] = false;
      }
    });

    return ownershipMap;
  };

  return {
    reviews: reviewsQuery.data?.reviews ?? [],
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error?.message ?? null,
    reviewOwnership: {} as Record<string, boolean>,
    hasMore: reviewsQuery.data?.hasMore ?? false,
    isLoadingMore: false,
    totalReviews: reviewsQuery.data?.totalReviews ?? 0,
    isSubmitting: submitMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    loadMore: async () => {
      // For load more, invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.forContent(contentId),
      });
    },
    createReview: async (rating: number, contentReviewed: string) => {
      try {
        await submitMutation.mutateAsync({ rating, contentReviewed });
        return true;
      } catch {
        return false;
      }
    },
    updateReview: async (
      reviewId: string,
      rating: number,
      contentReviewed: string,
    ) => {
      try {
        await updateMutation.mutateAsync({ reviewId, rating, contentReviewed });
        return true;
      } catch {
        return false;
      }
    },
    deleteReview: async (reviewId: string) => {
      try {
        await deleteMutation.mutateAsync(reviewId);
        return true;
      } catch {
        return false;
      }
    },
    refetch: reviewsQuery.refetch,
    checkOwnershipForReviews,
  };
}
