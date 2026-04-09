"use client";

import { useState, useEffect } from "react";
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
  reviewControllerCheckReviewOwner,
} from "@/apis/api/review";
import { toast } from "sonner";

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
  // Favorite states
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Watchlist states
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  // Rating states
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [currentReview, setCurrentReview] = useState<string>("");
  const [reviewId, setReviewId] = useState<string>("");
  const [hasExistingReview, setHasExistingReview] = useState(false);

  // Fetch favorite status
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!contentId || !enabled) return;

      try {
        const response = await favoriteControllerGetFavoriteStatus({
          contentId,
        });

        if (response?.data) {
          setIsFavorite(response.data.data.isFavorited || false);
        }
      } catch (err) {
        console.error("Error fetching favorite status:", err);
        setIsFavorite(false);
      }
    };

    fetchFavoriteStatus();
  }, [contentId, enabled]);

  // Fetch watchlist status
  useEffect(() => {
    const fetchWatchlistStatus = async () => {
      if (!contentId || !enabled) return;

      try {
        const response = await watchListControllerCheckInWatchList({
          contentId,
        });

        if (response?.data) {
          setIsInWatchlist(response.data.data.isInWatchList || false);
        }
      } catch (err) {
        console.error("Error fetching watchlist status:", err);
        setIsInWatchlist(false);
      }
    };

    fetchWatchlistStatus();
  }, [contentId, enabled]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!contentId) {
      toast.error("Content information not found");
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteControllerRemoveFavorite({ contentId });
        setIsFavorite(false);
        toast.success("Unliked successfully");
      } else {
        await favoriteControllerCreateFavorite({ contentId });
        setIsFavorite(true);
        toast.success("Liked successfully");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Please log in to perform this action!");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Toggle watchlist
  const toggleWatchlist = async () => {
    if (!contentId) {
      toast.error("Content information not found");
      return;
    }

    setIsWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await watchListControllerRemoveFromWatchList({ contentId });
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await watchListControllerAddToWatchList({ contentId });
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (err) {
      console.error("Error toggling watchlist:", err);
      toast.error("Please log in to perform this action!");
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  // Submit rating
  const submitRating = async (rating: number, review: string) => {
    if (!contentId) {
      toast.error("Không tìm thấy thông tin nội dung");
      return;
    }

    try {
      if (hasExistingReview && reviewId) {
        // Update existing review
        await reviewControllerUpdateReview({ id: reviewId }, {
          id: reviewId,
          contentId,
          rating,
          contentReviewed: review,
        } as any);
        toast.success("Update review successfully");
      } else {
        // Create new review
        const response = await reviewControllerCreateReview({
          contentId,
          rating,
          contentReviewed: review,
        } as any);

        if (response?.data?.data?.id) {
          setReviewId(response.data.data.id);
          setHasExistingReview(true);
        }

        toast.success("Submit review successfully");
      }

      setCurrentRating(rating);
      setCurrentReview(review);
    } catch (err: any) {
      console.error("Error submitting rating:", err);

      // Handle specific error: user already reviewed
      if (err?.response?.data?.message?.includes("already reviewed")) {
        toast.error("You have already reviewed this content!");
      } else {
        toast.error("Please log in to submit a review!");
      }
    }
  };

  return {
    // Favorite
    isFavorite,
    isFavoriteLoading,
    toggleFavorite,
    // Watchlist
    isInWatchlist,
    isWatchlistLoading,
    toggleWatchlist,
    // Rating
    currentRating,
    currentReview,
    submitRating,
  };
}
