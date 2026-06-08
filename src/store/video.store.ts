"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { watchProgressControllerCreateOrUpdateWatchProgress } from "@/apis/api/watchProgress";
import { useAuthStore } from "./auth.store";

export type VideoContentType = "movie" | "tv_series" | null;
export type VideoQuality = "auto" | "1080p" | "720p" | "480p";

export interface VideoState {
  contentId: string | null;
  episodeId: string | null;
  contentType: VideoContentType;
  resumePosition: number;
  quality: VideoQuality;
  hasAccess: boolean;
  isMuted: boolean;
  volume: number;
}

export interface VideoActions {
  setContent: (
    contentId: string | null,
    episodeId?: string | null,
    contentType?: VideoContentType,
  ) => void;
  updateProgress: (seconds: number) => void;
  setQuality: (quality: VideoQuality) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  clearContent: () => void;
  hydrateFromSession: () => void;
}

export type VideoStore = VideoState & VideoActions;

const SESSION_STORAGE_KEY = "cinemakatok-video-session";
const PREFERENCES_STORAGE_KEY = "cinemakatok-video-preferences";
const DEBOUNCE_SYNC_MS = 1500;

let progressSyncTimer: ReturnType<typeof setTimeout> | null = null;

type SessionSnapshot = Pick<
  VideoState,
  "contentId" | "episodeId" | "contentType" | "resumePosition"
>;

function readSessionSnapshot(): SessionSnapshot | null {
  if (typeof window === "undefined") return null;

  const rawSnapshot = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawSnapshot) return null;

  try {
    return JSON.parse(rawSnapshot) as SessionSnapshot;
  } catch {
    return null;
  }
}

function writeSessionSnapshot(snapshot: SessionSnapshot) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
}

function clearSessionSnapshot() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

async function syncProgressToBackend(
  contentId: string,
  resumePosition: number,
) {
  if (!useAuthStore.getState().isAuthenticated) return;

  try {
    await watchProgressControllerCreateOrUpdateWatchProgress({
      videoId: contentId,
      watchedDuration: Math.floor(resumePosition),
    });
  } catch (error) {
    console.error("Failed to sync watch progress:", error);
  }
}

function scheduleProgressSync(contentId: string, resumePosition: number) {
  if (progressSyncTimer) {
    clearTimeout(progressSyncTimer);
  }

  progressSyncTimer = setTimeout(() => {
    void syncProgressToBackend(contentId, resumePosition);
  }, DEBOUNCE_SYNC_MS);
}

export const useVideoStore = create<VideoStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        contentId: null,
        episodeId: null,
        contentType: null,
        resumePosition: 0,
        quality: "auto",
        hasAccess: false,
        isMuted: false,
        volume: 1,

        setContent: (contentId, episodeId = null, contentType = null) => {
          const snapshot = readSessionSnapshot();
          const nextResumePosition =
            snapshot && snapshot.contentId === contentId
              ? snapshot.resumePosition
              : 0;

          set({
            contentId,
            episodeId,
            contentType,
            resumePosition: nextResumePosition,
          });

          if (contentId) {
            writeSessionSnapshot({
              contentId,
              episodeId,
              contentType,
              resumePosition: nextResumePosition,
            });
          } else {
            clearSessionSnapshot();
          }
        },

        updateProgress: (seconds) => {
          const contentId = get().contentId;
          if (!contentId || !Number.isFinite(seconds) || seconds < 0) return;

          const sessionSnapshot = {
            contentId,
            episodeId: get().episodeId,
            contentType: get().contentType,
            resumePosition: seconds,
          } satisfies SessionSnapshot;

          set({ resumePosition: seconds });
          writeSessionSnapshot(sessionSnapshot);
          scheduleProgressSync(contentId, seconds);
        },

        setQuality: (quality) => set({ quality }),

        setVolume: (volume) =>
          set({
            volume: Math.max(0, Math.min(1, volume)),
            isMuted: volume <= 0,
          }),

        setMuted: (isMuted) => set({ isMuted }),

        clearContent: () => {
          if (progressSyncTimer) {
            clearTimeout(progressSyncTimer);
            progressSyncTimer = null;
          }

          set({
            contentId: null,
            episodeId: null,
            contentType: null,
            resumePosition: 0,
            hasAccess: false,
          });
          clearSessionSnapshot();
        },

        hydrateFromSession: () => {
          const snapshot = readSessionSnapshot();
          if (!snapshot) return;

          set({
            contentId: snapshot.contentId,
            episodeId: snapshot.episodeId,
            contentType: snapshot.contentType,
            resumePosition: snapshot.resumePosition,
          });
        },
      }),
      {
        name: PREFERENCES_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          quality: state.quality,
          volume: state.volume,
          isMuted: state.isMuted,
        }),
      },
    ),
  ),
);
