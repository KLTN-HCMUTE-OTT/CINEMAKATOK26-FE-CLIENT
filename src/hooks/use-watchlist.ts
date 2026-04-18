"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  watchListControllerAddToWatchList,
  watchListControllerRemoveFromWatchList,
  watchListControllerCheckInWatchList,
} from "@/apis/api/watchList";
import { toast } from "sonner";
import { isAuthenticated } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import { useUIStore } from "@/store";

/**
 * Query hook for checking watchlist status of a content item
 */
export function useWatchlistStatusQuery(contentId?: string) {
  return useQuery({
    queryKey: queryKeys.watchlist.status(contentId ?? ""),
    queryFn: async () => {
      const response = await watchListControllerCheckInWatchList({
        contentId: contentId!,
      });
      return {
        isInWatchList: response?.data?.data?.isInWatchList || false,
      };
    },
    enabled: !!contentId && isAuthenticated(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Mutation hook for toggling watchlist status with optimistic updates
 */
export function useToggleWatchlistMutation(contentId?: string) {
  const queryClient = useQueryClient();
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  return useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (!contentId) throw new Error("Content ID is required");

      if (action === "add") {
        return watchListControllerAddToWatchList({ contentId });
      } else {
        return watchListControllerRemoveFromWatchList({ contentId });
      }
    },

    // Optimistic update
    onMutate: async (action) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.watchlist.status(contentId ?? ""),
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(
        queryKeys.watchlist.status(contentId ?? ""),
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.watchlist.status(contentId ?? ""),
        { isInWatchList: action === "add" },
      );

      return { previousStatus };
    },

    onError: (_err, _action, context) => {
      // Rollback on error
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          queryKeys.watchlist.status(contentId ?? ""),
          context.previousStatus,
        );
      }
      const status = (_err as any)?.response?.status;
      if (status === 401 || status === 403) {
        openLoginModal();
      } else {
        toast.error("Failed to update watchlist");
      }
    },

    onSuccess: (_data, action) => {
      toast.success(
        action === "add" ? "Added to watchlist" : "Removed from watchlist",
      );
    },

    onSettled: () => {
      // Always refetch to ensure server sync
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
  });
}

/**
 * Legacy-compatible hook preserving the original API
 */
interface UseWatchlistOptions {
  movieId?: string;
  contentId?: string;
  type?: "MOVIE" | "TVSERIES";
  autoCheck?: boolean;
  onLoginRequired?: () => void;
}

export function useWatchlist({
  contentId,
  onLoginRequired,
}: UseWatchlistOptions) {
  const statusQuery = useWatchlistStatusQuery(contentId);
  const toggleMutation = useToggleWatchlistMutation(contentId);

  const isInWatchlist = statusQuery.data?.isInWatchList ?? false;

  const addToWatchlist = async () => {
    if (!isAuthenticated()) {
      if (onLoginRequired) onLoginRequired();
      else toast.error("Please login to add to watchlist");
      return;
    }
    await toggleMutation.mutateAsync("add");
  };

  const removeFromWatchlist = async () => {
    if (!isAuthenticated()) {
      if (onLoginRequired) onLoginRequired();
      else toast.error("Please login to manage watchlist");
      return;
    }
    await toggleMutation.mutateAsync("remove");
  };

  const toggleWatchlist = async () => {
    if (isInWatchlist) {
      await removeFromWatchlist();
    } else {
      await addToWatchlist();
    }
  };

  return {
    isInWatchlist,
    isLoading: toggleMutation.isPending,
    isChecking: statusQuery.isLoading,
    isLoggedIn: isAuthenticated(),
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    checkWatchlist: () => statusQuery.refetch(),
  };
}
