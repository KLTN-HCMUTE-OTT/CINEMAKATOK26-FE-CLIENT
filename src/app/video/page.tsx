/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import VideoPlayerComponent from "@/components/ui/video-player/movie-video-player";
import useVideoAccess from "@/hooks/use-video-access";
import { ProtectedRoute } from "@/components/protected-route";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { videoControllerFindOne } from "@/apis/api/video";

function VideoContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId") || "";
  const { videoContent } = useVideoAccess("");
  const [videoDetails, setVideoDetails] = useState<any>(null);

  useEffect(() => {
    if (videoId) {
      videoControllerFindOne({ id: videoId })
        .then((res) => {
          setVideoDetails(res.data.data);
        })
        .catch((err) => console.error("Failed to fetch video details", err));
    }
  }, [videoId]);

  return (
    <div className="w-full h-screen bg-black">
      {videoContent && videoDetails && (
        <VideoPlayerComponent
          {...videoContent}
          videoId={videoId}
          sprites={videoDetails.sprites}
          vttFiles={videoDetails.vttFiles}
        />
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
