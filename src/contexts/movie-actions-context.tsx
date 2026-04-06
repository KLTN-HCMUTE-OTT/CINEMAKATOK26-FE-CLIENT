/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  reviewControllerGetReviewForContent,
  reviewControllerCreateReview,
  reviewControllerUpdateReview,
  reviewControllerDeleteReview,
} from "@/apis/api/reviews";
import { toast } from "sonner";

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
  // Favorite states
  const [isFavorite, setIsFavorite] = useState(false);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Watchlist states
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  // Review states
  const [userReview, setUserReview] = useState<API.ReviewDto | null>(null);
  const [allReviews, setAllReviews] = useState<API.ReviewDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const REVIEWS_PER_PAGE = 10;

  // Check if user is logged in
  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
  };

  // Fetch favorite status
  const refetchFavoriteStatus = async () => {
    if (!contentId) return;

    // Skip if not logged in (silent fail, no error)
    if (!isLoggedIn()) {
      setIsFavorite(false);
      setTotalFavorites(0);
      return;
    }

    try {
      const response = await favoriteControllerGetFavoriteStatus({
        contentId,
      });

      if (response?.data) {
        setIsFavorite(response.data.data.isFavorited || false);
        setTotalFavorites(response.data.data.totalFavorites || 0);
      }
    } catch (err: any) {
      // Silent fail - don't show error to user
      // Only log if it's not an auth error
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.error("Error fetching favorite status:", err);
      }
      setIsFavorite(false);
      setTotalFavorites(0);
    }
  };

  // Fetch watchlist status
  const refetchWatchlistStatus = async () => {
    if (!contentId) return;

    // Skip if not logged in (silent fail, no error)
    if (!isLoggedIn()) {
      setIsInWatchlist(false);
      return;
    }

    try {
      const response = await watchListControllerCheckInWatchList({
        contentId,
      });

      if (response?.data) {
        setIsInWatchlist(response.data.data.isInWatchList || false);
      }
    } catch (err: any) {
      // Silent fail - don't show error to user
      // Only log if it's not an auth error
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.error("Error fetching watchlist status:", err);
      }
      setIsInWatchlist(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (contentId) {
      refetchFavoriteStatus();
      refetchWatchlistStatus();
      refetchReviews();
    }
  }, [contentId]);

  // Fetch reviews for content with pagination
  const fetchReviewsForPage = async (page: number) => {
    if (!contentId) return;

    setReviewsLoading(true);
    try {
      const response = await reviewControllerGetReviewForContent({
        contentId,
        page,
        limit: REVIEWS_PER_PAGE,
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
            (r: API.ReviewDto) => r.name === userName
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
        console.error("Error fetching reviews:", err);
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
    await fetchReviewsForPage(1);
  };

  // Load more reviews (next page)
  const loadMoreReviews = async () => {
    if (currentPage < totalPages) {
      await fetchReviewsForPage(currentPage + 1);
    }
  };

  // Go to specific page
  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      await fetchReviewsForPage(page);
    }
  };

  // Calculate hasMore
  const hasMore = currentPage < totalPages;

  // Submit or update review
  const submitReview = async (rating: number, review: string) => {
    if (!isLoggedIn()) {
      window.dispatchEvent(new Event("open-login-modal"));
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (!contentId) {
      toast.error("Không tìm thấy thông tin nội dung");
      return;
    }

    try {
      if (userReview) {
        // Update existing review
        await reviewControllerUpdateReview(
          { id: userReview.id },
          {
            id: userReview.id,
            contentId,
            rating,
            contentReviewed: review,
          }
        );
        toast.success("Đã cập nhật đánh giá");
      } else {
        // Create new review
        await reviewControllerCreateReview({
          contentId,
          rating,
          contentReviewed: review,
        });
        toast.success("Đã gửi đánh giá thành công");
      }

      // Refetch reviews to update list
      await refetchReviews();
    } catch (err: any) {
      console.error("Error submitting review:", err);

      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.dispatchEvent(new Event("open-login-modal"));
        toast.error("Vui lòng đăng nhập để đánh giá!");
      } else if (err?.response?.data?.message?.includes("already reviewed")) {
        toast.error("Bạn đã đánh giá nội dung này rồi!");
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
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
      await reviewControllerDeleteReview({ id: reviewId });
      toast.success("Đã xóa đánh giá");

      // Refetch reviews to update list
      await refetchReviews();
    } catch (err: any) {
      console.error("Error deleting review:", err);

      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.dispatchEvent(new Event("open-login-modal"));
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    }
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    // Check login first
    if (!isLoggedIn()) {
      window.dispatchEvent(new Event("open-login-modal"));
      return;
    }

    if (!contentId) {
      toast.error("Không tìm thấy thông tin nội dung");
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteControllerRemoveFavorite({ contentId });
        setIsFavorite(false);
        setTotalFavorites((prev) => Math.max(0, prev - 1));
        toast.success("Đã bỏ thích");
      } else {
        await favoriteControllerCreateFavorite({ contentId });
        setIsFavorite(true);
        setTotalFavorites((prev) => prev + 1);
        toast.success("Đã thêm vào yêu thích");
      }
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      // Better error message based on error type
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.dispatchEvent(new Event("open-login-modal"));
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Toggle watchlist
  const toggleWatchlist = async () => {
    // Check login first
    if (!isLoggedIn()) {
      window.dispatchEvent(new Event("open-login-modal"));
      return;
    }

    if (!contentId) {
      toast.error("Không tìm thấy thông tin phim");
      return;
    }

    setIsWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await watchListControllerRemoveFromWatchList({ contentId });
        setIsInWatchlist(false);
        toast.success("Đã xóa khỏi danh sách");
      } else {
        await watchListControllerAddToWatchList({ contentId });
        setIsInWatchlist(true);
        toast.success("Đã thêm vào danh sách");
      }
    } catch (err: any) {
      console.error("Error toggling watchlist:", err);
      // Better error message based on error type
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        window.dispatchEvent(new Event("open-login-modal"));
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  return (
    <ActionsContext.Provider
      value={{
        isFavorite,
        totalFavorites,
        isFavoriteLoading,
        toggleFavorite,
        isInWatchlist,
        isWatchlistLoading,
        toggleWatchlist,
        userReview,
        allReviews,
        reviewsLoading,
        currentPage,
        totalPages,
        totalReviews,
        hasMore,
        submitReview,
        deleteReview,
        refetchReviews,
        loadMoreReviews,
        goToPage,
        refetchFavoriteStatus,
        refetchWatchlistStatus,
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
