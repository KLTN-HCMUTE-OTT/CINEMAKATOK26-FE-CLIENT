/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { useWatchProgress } from "@/hooks/use-watch-progress";
import { useAuth } from "@/hooks/use-auth";
import { auditLogControllerCreateLog } from "@/apis/api/auditLogs";

interface UseVideoPlayerProps {
  src: string;
  type: string;
  autoPlay: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  videoId?: string; // New preferred parameter
  initialTime?: number;
  // add for tv series if needed
  episodeIndex?: number;
  totalEpisodes?: number;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
}

export function useVideoPlayer({
  src,
  type,
  autoPlay,
  onTimeUpdate,
  onEnded,
  videoId,
  initialTime,
  episodeIndex,
  totalEpisodes,
  onPrevEpisode,
  onNextEpisode,
}: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [availableQualities, setAvailableQualities] = useState<
    Array<{ label: string; height: number; index: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tooltipTime, setTooltipTime] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);
  const [volumeHoverValue, setVolumeHoverValue] = useState(1);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [dragVolume, setDragVolume] = useState<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingProgressRef = useRef(false);
  const isDraggingVolumeRef = useRef(false);
  const wasPlayingBeforeDragRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use watch progress hook
  const { trackProgress, markAsCompleted } = useWatchProgress({
    videoId,
    duration,
    enabled: !!videoId,
  });
  const auth = useAuth();

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initHls = () => {
      if (Hls.isSupported() && type === "application/x-mpegURL") {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          // xhrSetup: (xhr: XMLHttpRequest) => {
          //   xhr.withCredentials = true;
          // },
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest loaded");
          setError(null); // Clear any previous errors
          setRetryCount(0); // Reset retry count on successful load

          const levels = hls.levels;
          if (levels && levels.length > 0) {
            const qualities = levels
              .map((level: any, index: number) => {
                const height =
                  level.height || level.attrs?.RESOLUTION?.split("x")[1] || 0;
                return {
                  label: height ? `${height}p` : `Level ${index}`,
                  height: parseInt(height) || 0,
                  index: index,
                };
              })
              .filter((q) => q.height > 0);

            qualities.sort((a, b) => b.height - a.height);
            setAvailableQualities(qualities);
            console.log("Available qualities:", qualities);
          }

          setIsLoading(false);
          if (autoPlay) {
            video.play();
          }

          // Seek to initial time if provided
          if (initialTime && initialTime > 0) {
            video.currentTime = initialTime;
          }
        });

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          //console.error("HLS error:", data);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error, trying to recover");
                if (retryCount < 3) {
                  setRetryCount((prev) => prev + 1);
                  setTimeout(() => hls.startLoad(), 1000);
                } else {
                  setError(
                    "Network error: Unable to load video. Please check your connection and try again."
                  );
                  hls.destroy();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error, trying to recover");
                if (retryCount < 2) {
                  setRetryCount((prev) => prev + 1);
                  setTimeout(() => hls.recoverMediaError(), 1000);
                } else {
                  setError(
                    "Media error: Video format not supported or corrupted. Please try a different video."
                  );
                  hls.destroy();
                }
                break;
              default:
                console.log("Fatal error, destroying HLS");
                setError(
                  "Video playback error: Unable to play this video. Please try again later."
                );
                hls.destroy();
                break;
            }
          } else {
            // Non-fatal errors - just log but don't show to user
            console.warn("Non-fatal HLS error:", data);
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType(type)) {
        video.src = src;
        setIsLoading(false);
        if (autoPlay) {
          video.play();
        }

        // Seek to initial time if provided
        if (initialTime && initialTime > 0) {
          video.currentTime = initialTime;
        }
      }
    };

    initHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [src, type, autoPlay, initialTime]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
      trackProgress(video.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percentage = (bufferedEnd / video.duration) * 100;
        setBuffered(percentage);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      markAsCompleted();
      onEnded?.();

      if (onNextEpisode) {
        // Tốt nhất là thêm 1 chút delay để người dùng biết phim đã hết
        setTimeout(() => {
          onNextEpisode();
        }, 1000);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;

        case "n":
          // next episode
          if (onNextEpisode) {
            onNextEpisode();
          }
          break;
        case "p":
          // prev episode
          if (onPrevEpisode) onPrevEpisode();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle drag for progress bar and volume bar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgressRef.current) {
        if (progressBarRef.current && videoRef.current) {
          const rect = progressBarRef.current.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          const newTime = Math.max(0, Math.min(pos * duration, duration));
          videoRef.current.currentTime = newTime;
          setDragTime(newTime);
          setTooltipTime(newTime);
          setTooltipPosition(pos * 100 || 0);
          setShowProgressTooltip(true);
        }
      }

      if (isDraggingVolumeRef.current) {
        if (volumeBarRef.current && videoRef.current) {
          const rect = volumeBarRef.current.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          const newVolume = Math.max(0, Math.min(1, pos));
          setDragVolume(newVolume);
          setVolumeHoverValue(newVolume);
          videoRef.current.volume = newVolume;
          setIsMuted(newVolume === 0);
          setShowVolumeTooltip(true);
        }
      }
    };

    const handleMouseUp = () => {
      const wasPlaying = wasPlayingBeforeDragRef.current;
      isDraggingProgressRef.current = false;
      isDraggingVolumeRef.current = false;
      wasPlayingBeforeDragRef.current = false;
      setDragTime(null);
      setDragVolume(null);
      if (wasPlaying) {
        videoRef.current?.play();
      }
      setTimeout(() => {
        setShowProgressTooltip(false);
        setShowVolumeTooltip(false);
      }, 100);
    };

    if (isDraggingProgressRef.current || isDraggingVolumeRef.current) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [duration]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  // Handlers
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const retryVideo = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);

    // Re-initialize HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported() && type === "application/x-mpegURL") {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType(type)) {
      video.src = src;
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        if (auth.isAuthenticated) {
          try {
            await auditLogControllerCreateLog({
              videoId: videoId || "",
            });
          } catch (err) {}
        }
      } else {
        videoRef.current.pause();
      }
    }
  };

  const changeQuality = (qualityLabel: string) => {
    if (!hlsRef.current) return;

    const hls = hlsRef.current;

    if (qualityLabel === "Auto") {
      hls.currentLevel = -1;
      setQuality("Auto");
    } else {
      const selectedQuality = availableQualities.find(
        (q) => q.label === qualityLabel
      );

      if (selectedQuality) {
        hls.currentLevel = selectedQuality.index;
        setQuality(qualityLabel);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingProgressRef.current = true;
    wasPlayingBeforeDragRef.current = isPlaying;
    if (isPlaying) {
      videoRef.current?.pause();
    }
    handleSeek(e);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const hoverTime = pos * duration;
      setTooltipTime(hoverTime);
      setTooltipPosition(pos * 100 || 0);
      setShowProgressTooltip(true);
    }
  };

  const handleProgressMouseLeave = () => {
    setShowProgressTooltip(false);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current && videoRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newVolume = Math.max(0, Math.min(1, pos));
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingVolumeRef.current = true;
    handleVolumeChange(e);
  };

  const handleVolumeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const hoverVolume = Math.max(0, Math.min(1, pos));
      setVolumeHoverValue(hoverVolume);
      setShowVolumeTooltip(true);
    }
  };

  const handleVolumeMouseLeave = () => {
    setShowVolumeTooltip(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePIP = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error("PIP error:", error);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!isMenuOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !isMenuOpen) {
      setShowControls(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const prevEpisode = () => {
    // Chỉ cần có hàm là gọi, bỏ bớt điều kiện index đi
    if (onPrevEpisode) {
      onPrevEpisode();
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  const nextEpisode = () => {
    // Chỉ cần có hàm là gọi
    if (onNextEpisode) {
      onNextEpisode();
    } else {
      // Nếu không có tập tiếp theo thì pause
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  return {
    // Refs
    videoRef,
    containerRef,
    progressBarRef,
    volumeBarRef,
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    buffered,
    playbackRate,
    quality,
    availableQualities,
    isLoading,
    error,
    tooltipTime,
    tooltipPosition,
    showProgressTooltip,
    volumeHoverValue,
    showVolumeTooltip,
    dragTime,
    dragVolume,
    // Handlers
    formatTime,
    retryVideo,
    togglePlay,
    changeQuality,
    handleSeek,
    handleProgressMouseDown,
    handleProgressMouseMove,
    handleProgressMouseLeave,
    handleVolumeChange,
    handleVolumeMouseDown,
    handleVolumeMouseMove,
    handleVolumeMouseLeave,
    toggleMute,
    skip,
    toggleFullscreen,
    togglePIP,
    handleMouseMove,
    handleMouseLeave,
    setIsMenuOpen,
    changePlaybackRate,
    // TV series handlers
    prevEpisode,
    nextEpisode,
    episodeIndex,
    totalEpisodes,
  };
}
