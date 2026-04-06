import { useState, useEffect } from "react";
import {
  watchListControllerAddToWatchList,
  watchListControllerRemoveFromWatchList,
  watchListControllerCheckInWatchList,
  watchListControllerCheckInWatchListByMovieId,
} from "@/apis/api/watchList";
import { toast } from "sonner";

interface UseWatchlistOptions {
  movieId?: string;
  contentId?: string;
  type?: "MOVIE" | "TVSERIES";
  autoCheck?: boolean; // Automatically check if in watchlist on mount
  onLoginRequired?: () => void; // Callback when login is required
}

export function useWatchlist({
  movieId,
  contentId,
  type = "MOVIE",
  autoCheck = true,
  onLoginRequired,
}: UseWatchlistOptions) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check if user is logged in
  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
  };

  // Check if movie/content is in watchlist
  const checkWatchlist = async () => {
    if (!contentId || !isLoggedIn()) return;

    try {
      setIsChecking(true);
      const response = await watchListControllerCheckInWatchList({
        contentId,
      });

      if (response?.data?.data) {
        setIsInWatchlist(response.data.data.isInWatchList || false);
      }
    } catch (error) {
      console.error("Error checking watchlist:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto check on mount if enabled
  useEffect(() => {
    if (autoCheck && contentId && isLoggedIn()) {
      checkWatchlist();
    }
  }, [contentId, autoCheck]);

  // Add to watchlist
  const addToWatchlist = async () => {
    if (!isLoggedIn()) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast.error("Please login to add to watchlist");
      }
      return;
    }

    if (!contentId) {
      toast.error("Content ID is required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await watchListControllerAddToWatchList({
        contentId,
      });

      if (response?.data) {
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (error: any) {
      console.error("Error adding to watchlist:", error);

      let errorMessage = "Failed to add to watchlist";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async () => {
    if (!isLoggedIn()) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        toast.error("Please login to manage watchlist");
      }
      return;
    }

    if (!contentId) {
      toast.error("Content ID is required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await watchListControllerRemoveFromWatchList({
        contentId,
      });

      if (response?.data) {
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      }
    } catch (error: any) {
      console.error("Error removing from watchlist:", error);

      let errorMessage = "Failed to remove from watchlist";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle watchlist
  const toggleWatchlist = async () => {
    if (isInWatchlist) {
      await removeFromWatchlist();
    } else {
      await addToWatchlist();
    }
  };

  return {
    isInWatchlist,
    isLoading,
    isChecking,
    isLoggedIn: isLoggedIn(),
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    checkWatchlist,
  };
}
