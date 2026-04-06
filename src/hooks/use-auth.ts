"use client";

import { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser, clearAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { userControllerGetProfile } from "@/apis/api/user";
import { toast } from "sonner";

/**
 * Custom hook for authentication
 * Provides auth state and utility functions
 */
export function useAuth() {
  const [isAuth, setIsAuth] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState(() => getCurrentUser());

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status
  const checkAuth = () => {
    const authenticated = isAuthenticated();
    const currentUser = getCurrentUser();

    setIsAuth(authenticated);
    setUser(currentUser);
    setIsLoading(false);
  };

  // Check if user account is banned
  const checkBannedStatus = async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await userControllerGetProfile();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileData = (response as any)?.data?.data || response?.data;

      if (profileData) {
        // Check if user is banned
        if (profileData.isBanned || profileData.status === "BANNED") {
          const errorMessage = "Your account has been permanently banned";
          toast.error(errorMessage);

          // Logout user
          clearAuthData();
          setIsAuth(false);
          setUser(null);
          window.dispatchEvent(new Event("user-logged-out"));
          router.push("/");
          return;
        }

        // Update user data in state if needed
        const currentUser = getCurrentUser();
        if (
          currentUser &&
          JSON.stringify(currentUser) !== JSON.stringify(profileData)
        ) {
          localStorage.setItem("user", JSON.stringify(profileData));
          setUser(profileData);
        }
      }
    } catch (error: any) {
      // Also check if error is due to banned account (fallback)
      if (error?.response?.data?.code === "BANNED") {
        const errorMessage =
          error.response.data.message || "Your account has been banned";
        toast.error(errorMessage);

        // Logout user
        clearAuthData();
        setIsAuth(false);
        setUser(null);
        window.dispatchEvent(new Event("user-logged-out"));
        router.push("/");
      }
      // Ignore other errors (network, etc.)
    }
  };

  useEffect(() => {
    checkAuth();

    // Check banned status on mount
    checkBannedStatus();

    // Listen for login/logout events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("user-logged-in", handleAuthChange);
    window.addEventListener("user-logged-out", handleAuthChange);
    window.addEventListener("user-updated", handleAuthChange);

    return () => {
      window.removeEventListener("user-logged-in", handleAuthChange);
      window.removeEventListener("user-logged-out", handleAuthChange);
      window.removeEventListener("user-updated", handleAuthChange);
    };
  }, []);

  // Logout function
  const logout = () => {
    clearAuthData();
    setIsAuth(false);
    setUser(null);
    window.dispatchEvent(new Event("user-logged-out"));
    router.push("/");
  };

  // Require auth - redirect if not authenticated
  const requireAuth = (redirectUrl: string = "/") => {
    if (!isLoading && !isAuth) {
      router.push(redirectUrl);
      return false;
    }
    return true;
  };

  return {
    isAuthenticated: isAuth,
    user,
    isLoading,
    logout,
    requireAuth,
    checkAuth,
  };
}
