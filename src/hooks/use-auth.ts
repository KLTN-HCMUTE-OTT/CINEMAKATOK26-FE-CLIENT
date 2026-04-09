"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";

export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logoutAction = useAuthStore((s) => s.logout);
  const router = useRouter();

  const logout = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const requireAuth = (redirectUrl: string = "/") => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl);
      return false;
    }

    return true;
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout,
    requireAuth,
  };
}
