"use client";

/**
 * Content Censorship Preferences Store
 *
 * Persists the user's violence/nudity censorship sensitivity settings
 * in localStorage so they are loaded as defaults every time a video starts.
 *
 * This store is consumed by:
 *  - ContentPreferencesSection (profile settings UI)
 *  - CustomVideoPlayer (as initialPreferences)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ContentPreferences,
  CensorSensitivity,
  DEFAULT_CONTENT_PREFERENCES,
} from "@/types/censorship.types";
import {
  userControllerGetContentPreferences,
  userControllerUpdateContentPreferences,
} from "@/apis/api/users";
import { useAuthStore } from "./auth.store";

export interface ContentPreferencesState {
  preferences: ContentPreferences;
  isSyncing: boolean;
  setViolencePreference: (value: CensorSensitivity) => void;
  setNudityPreference: (value: CensorSensitivity) => void;
  setPreferences: (prefs: ContentPreferences) => void;
  resetPreferences: () => void;
  fetchPreferences: () => Promise<void>;
  updatePreferencesOnServer: (prefs: ContentPreferences) => Promise<void>;
}

export const useContentPreferencesStore = create<ContentPreferencesState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_CONTENT_PREFERENCES,
      isSyncing: false,

      setViolencePreference: (value) =>
        set((state) => ({
          preferences: { ...state.preferences, violence: value },
        })),

      setNudityPreference: (value) =>
        set((state) => ({
          preferences: { ...state.preferences, nudity: value },
        })),

      setPreferences: (prefs) => set({ preferences: prefs }),

      resetPreferences: () =>
        set({ preferences: DEFAULT_CONTENT_PREFERENCES }),

      fetchPreferences: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;

        set({ isSyncing: true });
        try {
          const response = await userControllerGetContentPreferences();
          const data = response?.data?.data;
          if (data && (data.violence || data.nudity)) {
            set({
              preferences: {
                violence: data.violence || "moderate",
                nudity: data.nudity || "moderate",
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch content preferences:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      updatePreferencesOnServer: async (prefs) => {
        set({ preferences: prefs, isSyncing: true });
        try {
          await userControllerUpdateContentPreferences(prefs);
        } catch (error) {
          console.error("Failed to update content preferences:", error);
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "cinemakatok-content-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);

// Subscribe to auth state changes to sync preferences automatically
if (typeof window !== "undefined") {
  useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        void useContentPreferencesStore.getState().fetchPreferences();
      } else {
        useContentPreferencesStore.getState().resetPreferences();
      }
    },
    { fireImmediately: true }
  );
}

