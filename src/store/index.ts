import { useAuthStore } from "./auth.store";
import { useVideoStore } from "./video.store";

export { useAuthStore };
export type {
  AuthStore,
  AuthState,
  AuthActions,
  AuthUser,
  LoginCredentials,
} from "./auth.store";
export { useUIStore } from "./ui.store";
export type { UIStore } from "./ui.store";
export { useVideoStore } from "./video.store";
export type {
  VideoStore,
  VideoState,
  VideoActions,
  VideoQuality,
  VideoContentType,
} from "./video.store";

export function hydrateStores() {
  if (typeof window === "undefined") return;
  useAuthStore.getState().hydrateFromSession();
  useVideoStore.getState().hydrateFromSession();
}
