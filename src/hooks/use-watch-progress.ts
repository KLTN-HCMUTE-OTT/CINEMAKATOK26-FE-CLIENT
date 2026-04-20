import { useEffect, useRef, useState } from "react";
import { watchProgressControllerGetResumeData } from "@/apis/api/watchProgress";
import { useAuthStore, useVideoStore } from "@/store";

interface UseWatchProgressProps {
  videoId?: string; // New preferred parameter
  duration?: number;
  enabled?: boolean;
  contentType?: "movie" | "tv_series" | null;
  episodeId?: string | null;
}

interface ResumeData {
  watchedDuration: number;
  isCompleted: boolean;
}

export function useWatchProgress({
  videoId,
  duration = 0,
  enabled = true,
  contentType = "movie",
  episodeId = null,
}: UseWatchProgressProps) {
  const targetId = videoId;
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastProgressRef = useRef<number>(0);
  const updateProgress = useVideoStore((state) => state.updateProgress);
  const setContent = useVideoStore((state) => state.setContent);
  const storedResumePosition = useVideoStore((state) => state.resumePosition);
  const storedContentId = useVideoStore((state) => state.contentId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (!enabled || !targetId || targetId.trim() === "") {
      setIsLoading(false);
      return;
    }

    setContent(targetId, episodeId, contentType);

    if (storedContentId === targetId && storedResumePosition > 0) {
      setResumeData({
        watchedDuration: storedResumePosition,
        isCompleted: false,
      });
      setCurrentProgress(storedResumePosition);
      setIsCompleted(false);
      setIsLoading(false);
      return;
    }

    const fetchResumeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const axiosResponse = await watchProgressControllerGetResumeData({
          videoId: targetId,
        });
        const watchProgressData = axiosResponse.data.data;
        if (watchProgressData && typeof watchProgressData === "object") {
          const watchedDuration = watchProgressData.watchedDuration ?? 0;
          const isCompleted = watchProgressData.isCompleted ?? false;

          if (watchedDuration > 0 || isCompleted) {
            setResumeData({
              watchedDuration,
              isCompleted,
            });
            setCurrentProgress(watchedDuration);
            setIsCompleted(isCompleted);
            updateProgress(watchedDuration);
          } else {
            setResumeData(null);
            setCurrentProgress(0);
            setIsCompleted(false);
          }
        }
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err !== null && "response" in err
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (err as any).response?.status
            : undefined;

        if (status === 404) {
          setResumeData(null);
          setCurrentProgress(0);
          setIsCompleted(false);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch watch progress",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [
    enabled,
    isAuthenticated,
    setContent,
    storedContentId,
    storedResumePosition,
    targetId,
    updateProgress,
    contentType,
    episodeId,
  ]);

  const updateWatchProgress = async (watchedDuration: number) => {
    if (!isAuthenticated) {
      return;
    }

    if (!enabled || !targetId || targetId.trim() === "") {
      return;
    }

    updateProgress(watchedDuration);
  };

  const trackProgress = (newProgress: number) => {
    setCurrentProgress(newProgress);
    lastProgressRef.current = newProgress;
    void updateWatchProgress(newProgress);
  };

  const markAsCompleted = async () => {
    if (!isAuthenticated) {
      return;
    }

    if (!enabled || !targetId || targetId.trim() === "") {
      return;
    }

    try {
      setIsCompleted(true);
      updateProgress(duration);
    } catch (err) {
      setError("Failed to mark content as completed");
    }
  };

  useEffect(() => {
    return () => {};
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
