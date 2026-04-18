"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  favoriteControllerCreateFavorite,
  favoriteControllerRemoveFavorite,
  favoriteControllerGetFavoriteStatus,
} from "@/apis/api/favorites";
import { toast } from "sonner";
import { isAuthenticated } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import { useUIStore } from "@/store";

/**
 * Query hook for checking favorite status
 */
export function useFavoriteStatusQuery(contentId?: string) {
  return useQuery({
    queryKey: queryKeys.favorites.status(contentId ?? ""),
    queryFn: async () => {
      const response = await favoriteControllerGetFavoriteStatus({
        contentId: contentId!,
      });
      return {
        isFavorited: response?.data?.data?.isFavorited || false,
        totalFavorites: response?.data?.data?.totalFavorites || 0,
      };
    },
    enabled: !!contentId && isAuthenticated(),
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation hook for toggling favorite with optimistic updates
 */
export function useToggleFavoriteMutation(contentId?: string) {
  const queryClient = useQueryClient();
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  return useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (!contentId) throw new Error("Content ID is required");

      if (action === "add") {
        return favoriteControllerCreateFavorite({ contentId });
      } else {
        return favoriteControllerRemoveFavorite({ contentId });
      }
    },

    onMutate: async (action) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.favorites.status(contentId ?? ""),
      });

      const previousStatus = queryClient.getQueryData<{
        isFavorited: boolean;
        totalFavorites: number;
      }>(queryKeys.favorites.status(contentId ?? ""));

      queryClient.setQueryData(
        queryKeys.favorites.status(contentId ?? ""),
        {
          isFavorited: action === "add",
          totalFavorites:
            (previousStatus?.totalFavorites ?? 0) +
            (action === "add" ? 1 : -1),
        },
      );

      return { previousStatus };
    },

    onError: (_err, _action, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          queryKeys.favorites.status(contentId ?? ""),
          context.previousStatus,
        );
      }
      const status = (_err as any)?.response?.status;
      if (status === 401 || status === 403) {
        openLoginModal();
      } else {
        toast.error("An error occurred. Please try again!");
      }
    },

    onSuccess: (_data, action) => {
      toast.success(action === "add" ? "Added to favorites" : "Removed from favorites");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}
