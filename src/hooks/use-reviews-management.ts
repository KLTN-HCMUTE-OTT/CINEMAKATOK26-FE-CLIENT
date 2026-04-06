"use client";

import { useState, useCallback, useEffect } from "react";
import {
  reviewControllerCreateReview,
  reviewControllerGetReviewForContent,
  reviewControllerCheckReviewOwner,
  reviewControllerUpdateReview,
  reviewControllerDeleteReview,
} from "@/apis/api/reviews";
import { toast } from "sonner";

interface UseReviewsManagementProps {
  contentId: string;
  userId?: string;
}

export function useReviewsManagement({
  contentId,
  userId,
}: UseReviewsManagementProps) {
  const [reviews, setReviews] = useState<API.ReviewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewOwnership, setReviewOwnership] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const REVIEWS_PER_PAGE = 25;

  //  Check ownership for reviews
  const checkOwnership = useCallback(
    async (reviewIds: string[]) => {
      if (!userId || reviewIds.length === 0) return;

      const ownershipResults = await Promise.allSettled(
        reviewIds.map((id) => reviewControllerCheckReviewOwner({ id }))
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

      setReviewOwnership((prev) => ({ ...prev, ...ownershipMap }));
    },
    [userId]
  );

  //  Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await reviewControllerGetReviewForContent({
        contentId: contentId,
        page: 1,
        limit: REVIEWS_PER_PAGE,
      });

      if (data?.data) {
        setReviews(data.data);
        setTotalReviews(data.meta?.totalItems || 0);
        setHasMore(
          data.meta ? data.meta.currentPage < data.meta.totalPages : false
        );
        setCurrentPage(1);

        // Check ownership for all reviews
        const reviewIds = data.data.map((review) => review.id);
        await checkOwnership(reviewIds);
      } else {
        setReviews([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải đánh giá";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [contentId, checkOwnership]);

  //  Load more reviews
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const { data } = await reviewControllerGetReviewForContent({
        contentId: contentId,
        page: nextPage,
        limit: REVIEWS_PER_PAGE,
      });

      if (data?.data) {
        setReviews((prev) => [...prev, ...data.data]);
        setCurrentPage(nextPage);
        setHasMore(
          data.meta ? data.meta.currentPage < data.meta.totalPages : false
        );

        // Check ownership for new reviews
        const reviewIds = data.data.map((review) => review.id);
        await checkOwnership(reviewIds);
      }
    } catch (err) {
      console.error("Error loading more reviews:", err);
      toast.error("Không thể tải thêm đánh giá");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, contentId, checkOwnership]);

  //  Create review
  const createReview = useCallback(
    async (rating: number, contentReviewed: string) => {
      setIsSubmitting(true);

      try {
        const { data } = await reviewControllerCreateReview({
          contentId: contentId,
          rating,
          contentReviewed: contentReviewed.trim(),
        } as any);

        if (data.data) {
          const newReview: API.ReviewDto = {
            id: data.data.id,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            contentReviewed: data.data.contentReviewed,
            rating: data.data.rating,
            name: data.data.name,
            avatar: data.data.avatar,
            contentId: data.data.contentId,
            userId: data.data.userId,
            status: data.data.status,
          };
          setReviews((prev) => [newReview, ...prev]);
          setTotalReviews((prev) => prev + 1);

          // Check ownership for newly created review
          await checkOwnership([data.data.id]);

          toast.success("Cảm ơn bạn đã đánh giá!");
          return true;
        }
        return false;
      } catch (err) {
        console.error("Error submitting review:", err);
        toast.error(
          err instanceof Error ? err.message : "Không thể gửi đánh giá"
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [contentId, checkOwnership]
  );

  //  Update review
  const updateReview = useCallback(
    async (reviewId: string, rating: number, contentReviewed: string) => {
      setIsUpdating(true);

      try {
        const { data } = await reviewControllerUpdateReview({ id: reviewId }, {
          rating: rating,
          contentReviewed: contentReviewed.trim(),
          contentId: contentId,
        } as any);

        if (data.data) {
          setReviews((prev) =>
            prev.map((review) =>
              review.id === reviewId
                ? {
                    ...review,
                    rating: data.data.rating,
                    contentReviewed: data.data.contentReviewed,
                    updatedAt: data.data.updatedAt,
                  }
                : review
            )
          );

          toast.success("Cập nhật đánh giá thành công!");
          return true;
        }
        return false;
      } catch (err) {
        console.error("Error updating review:", err);
        toast.error(
          err instanceof Error ? err.message : "Không thể cập nhật đánh giá"
        );
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [contentId]
  );

  //  Delete review
  const deleteReview = useCallback(async (reviewId: string) => {
    setIsDeleting(true);

    try {
      await reviewControllerDeleteReview({ id: reviewId });

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      setTotalReviews((prev) => prev - 1);
      setReviewOwnership((prev) => {
        const newOwnership = { ...prev };
        delete newOwnership[reviewId];
        return newOwnership;
      });

      toast.success("Xóa đánh giá thành công!");
      return true;
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa đánh giá"
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  //  Initial fetch
  useEffect(() => {
    if (contentId) {
      fetchReviews();
    }
  }, [contentId, fetchReviews]);

  return {
    reviews,
    isLoading,
    error,
    reviewOwnership,
    hasMore,
    isLoadingMore,
    totalReviews,
    isSubmitting,
    isUpdating,
    isDeleting,
    loadMore,
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
}
