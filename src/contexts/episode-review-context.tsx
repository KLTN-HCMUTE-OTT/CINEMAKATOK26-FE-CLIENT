/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  episodeReviewControllerGetReviewForEpisode,
  episodeReviewControllerCreateReview,
  episodeReviewControllerUpdateReview,
  episodeReviewControllerDeleteReview,
} from "@/apis/api/episodeReviews";
import { toast } from "sonner";

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
  // Review states
  const [userReview, setUserReview] = useState<API.EpisodeReviewDto | null>(
    null
  );
  const [allReviews, setAllReviews] = useState<API.EpisodeReviewDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const REVIEWS_PER_PAGE = 10;

  // Check if user is logged in
  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
  };

  // Fetch reviews for episode with pagination
  const fetchReviewsForPage = async (
    page: number,
    order: "newest" | "oldest" = sortOrder
  ) => {
    if (!episodeId) return;

    setReviewsLoading(true);
    try {
      const response = await episodeReviewControllerGetReviewForEpisode({
        episodeId,
        page,
        limit: REVIEWS_PER_PAGE,
        sort: JSON.stringify({
          createdAt: order === "newest" ? "DESC" : "ASC",
        }),
      });

      if (response?.data) {
        const reviews = response.data.data || [];
        const meta = response.data.meta;

        if (page === 1) {
          // Replace all reviews for first page
          setAllReviews(reviews);
        } else {
          // Append reviews for load more
          setAllReviews((prev) => [...prev, ...reviews]);
        }

        // Update pagination info
        if (meta) {
          setCurrentPage(meta.currentPage || page);
          setTotalPages(meta.totalPages || 1);
          setTotalReviews(meta.totalItems || reviews.length);
        }

        // Find user's review if logged in
        if (isLoggedIn()) {
          const userName = JSON.parse(
            localStorage.getItem("user") || "{}"
          )?.name;
          const myReview = reviews.find(
            (r: API.EpisodeReviewDto) => r.name === userName
          );
          if (myReview) {
            setUserReview(myReview);
          } else if (page === 1) {
            // Only clear if on first page
            setUserReview(null);
          }
        } else {
          setUserReview(null);
        }
      }
    } catch (err: any) {
      // Silent fail for reviews
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.error("Error fetching episode reviews:", err);
      }
      if (page === 1) {
        setAllReviews([]);
        setUserReview(null);
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  // Refetch reviews (reset to page 1)
  const refetchReviews = async () => {
    setCurrentPage(1);
    await fetchReviewsForPage(1, sortOrder);
  };

  // Load more reviews (next page)
  const loadMoreReviews = async () => {
    if (currentPage < totalPages) {
      await fetchReviewsForPage(currentPage + 1, sortOrder);
    }
  };

  // Go to specific page
  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      await fetchReviewsForPage(page, sortOrder);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (episodeId) {
      refetchReviews();
    }
  }, [episodeId]);

  // Refetch when sort order changes
  useEffect(() => {
    if (episodeId) {
      setCurrentPage(1);
      fetchReviewsForPage(1, sortOrder);
    }
  }, [sortOrder]);

  // Calculate hasMore
  const hasMore = currentPage < totalPages;

  // Submit or update review
  const submitReview = async (comment: string) => {
    if (!isLoggedIn()) {
      window.dispatchEvent(new Event("open-login-modal"));
      toast.error("Please login to comment!");
      return;
    }

    if (!episodeId) {
      toast.error("Episode information not found");
      return;
    }

    try {
      if (userReview) {
        // Update existing review
        await episodeReviewControllerUpdateReview({ id: userReview.id }, {
          episodeId,
          contentReviewed: comment,
        } as any);
        toast.success("Update comment successfully");
      } else {
        // Create new review
        await episodeReviewControllerCreateReview({
          episodeId,
          contentReviewed: comment,
        } as any);
        toast.success("Comment submitted successfully");
      }

      // Refetch reviews to update list
      await refetchReviews();
    } catch (err: any) {
      console.error("Error submitting episode review:", err);

      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.dispatchEvent(new Event("open-login-modal"));
        toast.error("Please login to comment!");
      } else if (err?.response?.data?.message?.includes("already reviewed")) {
        toast.error("You have already reviewed this episode!");
      } else {
        toast.error("An error occurred. Please try again!");
      }
      throw err; // Re-throw to handle in component
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    if (!isLoggedIn()) {
      window.dispatchEvent(new Event("open-login-modal"));
      return;
    }

    try {
      await episodeReviewControllerDeleteReview({ id: reviewId });
      toast.success("Comment deleted successfully");

      // Refetch reviews to update list
      await refetchReviews();
    } catch (err: any) {
      console.error("Error deleting episode review:", err);

      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.dispatchEvent(new Event("open-login-modal"));
      } else {
        toast.error("An error occurred. Please try again!");
      }
    }
  };

  return (
    <EpisodeReviewContext.Provider
      value={{
        userReview,
        allReviews,
        reviewsLoading,
        currentPage,
        totalPages,
        totalReviews,
        hasMore,
        sortOrder,
        setSortOrder,
        submitReview,
        deleteReview,
        refetchReviews,
        loadMoreReviews,
        goToPage,
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
      "useEpisodeReview must be used within EpisodeReviewProvider"
    );
  }
  return context;
}
