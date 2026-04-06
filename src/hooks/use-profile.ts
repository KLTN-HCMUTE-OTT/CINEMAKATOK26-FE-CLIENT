"use client";

import { useState, useCallback } from "react";
import {
  userControllerGetProfile,
  userControllerUpdateProfile,
  userControllerUpdateAvatar,
} from "@/apis/api/user";
import { useAuth } from "./use-auth";
import { updateUserInLocalStorage } from "@/lib/auth";

export function useProfile() {
  const { checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userControllerGetProfile();
      // API returns { data: { data: ProfileResponse } }
      return (response as any).data.data;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: {
      name: string;
      avatar: string;
      gender: "MALE" | "FEMALE" | "OTHER";
      dateOfBirth?: string;
      address?: string;
      phoneNumber?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userControllerUpdateProfile({
          name: data.name,
          avatar: data.avatar,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth || "",
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
        } as any);

        // Update user in localStorage
        updateUserInLocalStorage({
          name: data.name,
          avatar: data.avatar,
          gender: data.gender,
        });

        // Refresh auth state
        checkAuth();

        return (response as any).data.data;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update profile";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuth]
  );

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userControllerUpdateAvatar({ avatarUrl });

        // Update avatar in localStorage
        updateUserInLocalStorage({ avatar: avatarUrl });

        // Refresh auth state
        checkAuth();

        return (response as any).data.data;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update avatar";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuth]
  );

  return {
    getProfile,
    updateProfile,
    updateAvatar,
    isLoading,
    error,
  };
}
