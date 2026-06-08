"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userControllerGetProfile,
  userControllerUpdateProfile,
  userControllerUpdateAvatar,
} from "@/apis/api/users";
import { useAuthStore } from "@/store";
import { queryKeys } from "@/lib/query-keys";

/**
 * Query hook for fetching user profile
 */
export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const response = await userControllerGetProfile();
      return (response as any).data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Mutation hook for updating user profile
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async (data: {
      name: string;
      avatar: string;
      gender: "MALE" | "FEMALE" | "OTHER";
      dateOfBirth?: string;
      address?: string;
      phoneNumber?: string;
    }) => {
      const response = await userControllerUpdateProfile({
        name: data.name,
        avatar: data.avatar,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || "",
        address: data.address || "",
        phoneNumber: data.phoneNumber || "",
      } as any);
      return (response as any).data.data;
    },
    onSuccess: (_data, variables) => {
      // Sync with Zustand auth store
      updateUser({
        name: variables.name,
        avatar: variables.avatar,
        gender: variables.gender,
      });
      // Invalidate profile cache to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
}

/**
 * Mutation hook for updating avatar
 */
export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await userControllerUpdateAvatar({ avatarUrl });
      return (response as any).data.data;
    },
    onSuccess: (_data, avatarUrl) => {
      updateUser({ avatar: avatarUrl });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
    },
  });
}

/**
 * Legacy-compatible hook that wraps new query/mutation hooks
 * Preserves the original API so consumers don't need immediate changes.
 */
export function useProfile() {
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateAvatarMutation = useUpdateAvatarMutation();

  return {
    getProfile: async () => {
      const result = await profileQuery.refetch();
      return result.data;
    },
    updateProfile: updateProfileMutation.mutateAsync,
    updateAvatar: updateAvatarMutation.mutateAsync,
    isLoading:
      profileQuery.isLoading ||
      updateProfileMutation.isPending ||
      updateAvatarMutation.isPending,
    error:
      profileQuery.error?.message ??
      updateProfileMutation.error?.message ??
      updateAvatarMutation.error?.message ??
      null,
  };
}
