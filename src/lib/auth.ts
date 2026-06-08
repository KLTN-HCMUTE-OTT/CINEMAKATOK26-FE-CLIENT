import { useAuthStore } from "@/store";

export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

export function getCurrentUser() {
  return useAuthStore.getState().user;
}
