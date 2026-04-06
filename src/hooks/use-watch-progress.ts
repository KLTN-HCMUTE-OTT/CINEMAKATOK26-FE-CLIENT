import { useEffect, useRef, useState } from "react";
import {
  watchProgressControllerCreateOrUpdateWatchProgress,
  watchProgressControllerGetWatchProgress,
  watchProgressControllerGetResumeData,
} from "@/apis/api/watchProgress";
import { isAuthenticated } from "@/lib/auth";

interface UseWatchProgressProps {
  videoId?: string; // New preferred parameter
  duration?: number;
  enabled?: boolean;
}

interface ResumeData {
  watchedDuration: number;
  isCompleted: boolean;
}

export function useWatchProgress({
  videoId,
  duration = 0,
  enabled = true,
}: UseWatchProgressProps) {
  // Use videoId as the primary identifier
  const targetId = videoId;
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastProgressRef = useRef<number>(0);
  const lastSyncTimeRef = useRef<number>(0);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch existing watch progress and resume data on mount
  useEffect(() => {
    // Check if user is authenticated before fetching
    if (!isAuthenticated()) {
      //console.log("⚠️ Skipping watch progress fetch - user not authenticated");
      setIsLoading(false);
      return;
    }

    if (!enabled || !targetId || targetId.trim() === "") {
      //console.log("⚠️ Skipping watch progress fetch - invalid targetId:", targetId, "enabled:", enabled);
      setIsLoading(false);
      return;
    }

    const fetchResumeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        //console.log("🔍 Fetching watch progress for videoId:", targetId);
        const axiosResponse = await watchProgressControllerGetResumeData({
          videoId: targetId,
        });
        const watchProgressData = axiosResponse.data.data;
        if (watchProgressData && typeof watchProgressData === "object") {
          // Extract watchedDuration and isCompleted from response
          const watchedDuration = watchProgressData.watchedDuration ?? 0;
          const isCompleted = watchProgressData.isCompleted ?? false;

          // Only update state if we got a meaningful value
          if (watchedDuration > 0 || isCompleted) {
            setResumeData({
              watchedDuration,
              isCompleted,
            });
            setCurrentProgress(watchedDuration);
            setIsCompleted(isCompleted);
          } else {
            // console.log(
            //   "⚠️ No watch progress data found (watchedDuration=0, not completed)"
            // );
          }
        } else {
          // console.log(
          //   "⚠️ Response data is not an object:",
          //   typeof axiosResponse.data,
          //   axiosResponse.data
          // );
        }
      } catch (err: any) {
        // Handle 404 as "no watch progress data found" instead of error
        if (err?.response?.status === 404) {
          //console.log("ℹ️ No watch progress found for videoId:", targetId, "- treating as new video");
          setResumeData(null);
          setCurrentProgress(0);
          setIsCompleted(false);
        } else {
          //console.error(" Failed to fetch resume data:", err);
          setError(err?.message || "Failed to fetch watch progress");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [targetId, enabled]);

  // Update watch progress to API
  const updateWatchProgress = async (watchedDuration: number) => {
    // Check if user is authenticated before updating
    if (!isAuthenticated()) {
      //console.log("⚠️ Skipping watch progress update - user not authenticated");
      return;
    }

    if (!enabled || !targetId || targetId.trim() === "") {
      //console.log("⚠️ Skipping watch progress update - invalid targetId:", targetId);
      return;
    }

    try {
      //console.log("Updating watch progress for videoId:", targetId, "duration:", watchedDuration);
      await watchProgressControllerCreateOrUpdateWatchProgress({
        videoId: targetId,
        watchedDuration: Math.floor(watchedDuration),
      });
    } catch (err) {
      console.error("Failed to update watch progress:", err);
    }
  };

  // Track progress changes - triggers API update every 5 seconds
  const trackProgress = (newProgress: number) => {
    setCurrentProgress(newProgress);
    lastProgressRef.current = newProgress;

    // Only proceed if enough time has passed since last sync
    const now = Date.now();
    if (now - lastSyncTimeRef.current >= 5000) {
      lastSyncTimeRef.current = now;
      updateWatchProgress(newProgress);
    }
  };

  // Mark as completed
  const markAsCompleted = async () => {
    // Check if user is authenticated before marking completed
    if (!isAuthenticated()) {
      //console.log("⚠️ Skipping mark as completed - user not authenticated");
      return;
    }

    if (!enabled || !targetId || targetId.trim() === "") {
      //console.log("⚠️ Skipping mark as completed - invalid targetId:", targetId);
      return;
    }

    try {
      setIsCompleted(true);
      //console.log("Marking as completed for videoId:", targetId);
      await watchProgressControllerCreateOrUpdateWatchProgress({
        videoId: targetId,
        watchedDuration: Math.floor(duration),
      });
    } catch (err) {
      //console.error("Failed to mark as completed:", err);
      setError("Failed to mark content as completed");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return {
    currentProgress,
    isCompleted,
    resumeData,
    isLoading,
    error,
    trackProgress,
    markAsCompleted,
    updateWatchProgress,
  };
}
