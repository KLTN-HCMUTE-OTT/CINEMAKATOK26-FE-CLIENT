"use client";

import { useState, useEffect } from "react";
import {
  watchListControllerGetUserWatchList,
  watchListControllerRemoveFromWatchList,
} from "@/apis/api/watchList";
import { toast } from "sonner";

interface WatchlistItem {
  id: string; // ID của watchlist record
  createdAt: string;
  updatedAt?: string;
  content: {
    id: string; // ID của movie/tvseries
    contentId: string; // Content ID
    title: string;
    type: "MOVIE" | "TVSERIES";
    thumbnail?: string;
    description?: string;
    releaseDate?: string;
    maturityRating?: string;
    trailer?: string;
    duration?: number;
    categories?: string[] | Array<{ id: string; name: string }>;
  };
}

// Transformed data for WatchListCard component
export interface WatchlistCardData {
  id: string; // Watchlist record ID (for selection in edit mode)
  contentId: string; // Movie/TVSeries ID (for navigation)
  movieContentId: string; // Content ID from API (for removal)
  type: string;
  title: string;
  image: string;
  genres: string[];
  year: string;
  duration: string;
  rating: string;
  youtubeTrailerUrl?: string;
}

interface UseUserWatchlistOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

/**
 * Hook to fetch and manage user's watchlist
 */
export function useUserWatchlist(options: UseUserWatchlistOptions = {}) {
  const { page = 1, limit = 100, autoFetch = true } = options;

  const [watchlist, setWatchlist] = useState<WatchlistCardData[]>([]);
  const [rawWatchlist, setRawWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Transform WatchlistItem to WatchlistCardData
  const transformWatchlistItem = (item: WatchlistItem): WatchlistCardData => {
    const { content, id } = item;

    // Extract year from releaseDate
    const year = content.releaseDate
      ? new Date(content.releaseDate).getFullYear().toString()
      : "N/A";

    // Format duration
    const duration = content.duration
      ? `${Math.floor(content.duration / 60)} hr ${content.duration % 60} mins`
      : "N/A";

    // Get genres - handle both string[] and object[]
    let genres: string[] = [];
    if (content.categories) {
      if (Array.isArray(content.categories)) {
        if (typeof content.categories[0] === "string") {
          genres = content.categories as string[];
        } else {
          genres = (
            content.categories as Array<{ id: string; name: string }>
          ).map((cat) => cat.name);
        }
      }
    }
    // Get image - use thumbnail or placeholder
    const image = content.thumbnail
      ? content.thumbnail.startsWith("http")
        ? content.thumbnail
        : `https://image.tmdb.org/t/p/w500${content.thumbnail}`
      : "/default_banner.jpg";

    // Get rating
    const rating = content.maturityRating || "NR";

    return {
      id, // Watchlist record ID (for selection)
      contentId: content.id, // Movie/TVSeries ID (for navigation to /movies/{id})
      movieContentId: content.contentId, // Content ID (for API removal)
      type: content.type,
      title: content.title,
      image,
      genres,
      year,
      duration,
      rating,
      youtubeTrailerUrl: content.trailer,
    };
  };

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await watchListControllerGetUserWatchList({
        page,
        limit,
      });

      if (response.data) {
        // Handle response based on structure
        const data = response.data.data || response.data;

        let items: WatchlistItem[] = [];

        if (Array.isArray(data)) {
          items = data;
          setTotalItems(data.length);
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
          setTotalItems(data.total || data.items.length);
          setTotalPages(
            data.totalPages || Math.ceil((data.total || 0) / limit)
          );
        }

        setRawWatchlist(items);
        // Transform items for card display
        const transformedItems = items.map(transformWatchlistItem);
        setWatchlist(transformedItems);

        console.log(
          "Transformed watchlist:",
          transformedItems.length > 0 ? transformedItems[0] : "empty"
        );
      }
    } catch (err: any) {
      console.error("Error fetching watchlist:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to fetch watchlist";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from watchlist with API call
  const removeFromWatchlist = async (movieContentId: string) => {
    try {
      setIsDeleting(true);

      // Use movieContentId (content.contentId from API)
      await watchListControllerRemoveFromWatchList({
        contentId: movieContentId,
      });

      // Update local state
      setWatchlist((prev) =>
        prev.filter((item) => item.movieContentId !== movieContentId)
      );
      setRawWatchlist((prev) =>
        prev.filter((item) => item.content.contentId !== movieContentId)
      );
      setTotalItems((prev) => Math.max(0, prev - 1));

      toast.success("Removed from watchlist");
    } catch (err: any) {
      console.error("Error removing from watchlist:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to remove from watchlist";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Remove multiple items from watchlist
  const removeMultipleFromWatchlist = async (movieContentIds: string[]) => {
    try {
      setIsDeleting(true);

      console.log("Removing multiple movieContentIds:", movieContentIds);

      // Remove all items in parallel
      await Promise.all(
        movieContentIds.map((movieContentId) =>
          watchListControllerRemoveFromWatchList({ contentId: movieContentId })
        )
      );

      // Update local state
      setWatchlist((prev) =>
        prev.filter((item) => !movieContentIds.includes(item.movieContentId))
      );
      setRawWatchlist((prev) =>
        prev.filter((item) => !movieContentIds.includes(item.content.contentId))
      );
      setTotalItems((prev) => Math.max(0, prev - movieContentIds.length));

      toast.success(`Removed ${movieContentIds.length} item(s) from watchlist`);
    } catch (err: any) {
      console.error("Error removing multiple items:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to remove items";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchWatchlist();
    }
  }, [page, limit, autoFetch]);

  return {
    watchlist,
    rawWatchlist,
    isLoading,
    isDeleting,
    error,
    totalItems,
    totalPages,
    refetch: fetchWatchlist,
    removeFromWatchlist,
    removeMultipleFromWatchlist,
  };
}
