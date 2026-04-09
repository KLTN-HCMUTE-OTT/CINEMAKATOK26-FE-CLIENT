"use client";

import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from "zustand/middleware";
import { setAccessTokenInMemory } from "@/lib/request";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  isAdmin?: boolean;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  loginWithGoogle: (googleToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
  hydrateFromSession: () => void;
}

export type AuthStore = AuthState & AuthActions;

function mapLoginUser(payload: unknown): AuthUser {
  const source = payload as Record<string, unknown>;
  const avatarValue = source.avatar;
  const avatar = typeof avatarValue === "string" ? avatarValue : null;

  return {
    id: String(source.id ?? ""),
    name: String(source.name ?? ""),
    email: typeof source.email === "string" ? source.email : undefined,
    avatar,
    isAdmin: typeof source.isAdmin === "boolean" ? source.isAdmin : undefined,
    gender:
      source.gender === "MALE" ||
      source.gender === "FEMALE" ||
      source.gender === "OTHER"
        ? source.gender
        : undefined,
  };
}

async function readErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

async function syncAccessTokenInMemory() {
  const refreshRes = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!refreshRes.ok) {
    setAccessTokenInMemory(null);
    return;
  }

  const refreshBody = (await refreshRes.json()) as { accessToken?: string };
  setAccessTokenInMemory(refreshBody.accessToken ?? null);
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,

        login: async (credentials) => {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          if (!res.ok) {
            throw new Error(await readErrorMessage(res, "Login failed"));
          }

          const body = (await res.json()) as { user?: unknown };
          const user = mapLoginUser(body.user ?? {});

          set({ user, isAuthenticated: true, isLoading: false });
          await syncAccessTokenInMemory();
          return user;
        },

        loginWithGoogle: async (googleToken) => {
          const res = await fetch("/api/auth/login-google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ googleToken }),
          });

          if (!res.ok) {
            throw new Error(await readErrorMessage(res, "Google login failed"));
          }

          const body = (await res.json()) as { user?: unknown };
          const user = mapLoginUser(body.user ?? {});

          set({ user, isAuthenticated: true, isLoading: false });
          await syncAccessTokenInMemory();
          return user;
        },

        logout: async () => {
          try {
            await fetch("/api/auth/logout", { method: "POST" });
          } finally {
            setAccessTokenInMemory(null);
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },

        updateUser: (partial) => {
          const current = get().user;
          if (!current) return;
          set({ user: { ...current, ...partial } });
        },

        hydrateFromSession: () => {
          const user = get().user;
          set({ isAuthenticated: Boolean(user), isLoading: false });
          if (user) {
            void syncAccessTokenInMemory();
          }
        },
      }),
      {
        name: "cinemakatok-auth",
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ user: state.user }),
        onRehydrateStorage: () => (state) => {
          if (!state) return;
          state.isAuthenticated = Boolean(state.user);
          state.isLoading = false;
        },
      },
    ),
  ),
);
