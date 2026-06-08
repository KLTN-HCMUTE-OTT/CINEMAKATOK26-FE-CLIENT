/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import VideoPlayerComponent from "@/components/ui/video-player/movie-video-player";
import useVideoAccess from "@/hooks/use-video-access";
import { ProtectedRoute } from "@/components/protected-route";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { videosControllerGetVideoById } from "@/apis/api/videos";

function VideoContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId") || "";
  const { videoContent, isLoading: isAccessLoading } = useVideoAccess(
    videoId ? { videoId } : ""
  );
  const [videoDetails, setVideoDetails] = useState<any>(null);

  useEffect(() => {
    if (videoId) {
      videosControllerGetVideoById({ id: videoId })
        .then((res) => {
          setVideoDetails(res.data.data);
        })
        .catch((err) => console.error("Failed to fetch video details", err));
    }
  }, [videoId]);

  if (isAccessLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg flex items-center gap-2">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          Loading secure video...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      {videoContent && videoDetails ? (
        <VideoPlayerComponent
          src={videoContent.src}
          type={videoContent.type}
          drmKeyId={videoContent.drmKeyId}
          videoId={videoId}
          sprites={videoDetails.sprites}
          vttFiles={videoDetails.vttFiles}
        />
      ) : (
        <div className="w-full h-screen bg-black flex items-center justify-center">
          <div className="text-red-500 text-lg">Failed to retrieve video details or stream.</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-white text-lg">Loading video...</div>
          </div>
        }
      >
        <VideoContent />
      </Suspense>
    </ProtectedRoute>
  );
}
