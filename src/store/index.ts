import { useAuthStore } from "./auth.store";

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

export function hydrateStores() {
  if (typeof window === "undefined") return;
  useAuthStore.getState().hydrateFromSession();
}
