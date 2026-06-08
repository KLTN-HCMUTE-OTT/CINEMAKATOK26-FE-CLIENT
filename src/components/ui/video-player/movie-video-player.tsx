"use client";

import { CustomVideoPlayer } from "./custom-video-player";

export interface MovieVideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  movieId?: string;
  videoId?: string; // New prop for video ID
  initialTime?: number;
  sprites?: string[];
  vttFiles?: string[];
  drmKeyId?: string | null;
  // Phase 4: Content Censorship
  violentSegments?: unknown;
  nuditySegments?: unknown;
}

const MovieVideoPlayerComponent = ({
  src,
  type = "application/x-mpegURL",
  poster,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  movieId,
  videoId,
  initialTime,
  sprites,
  vttFiles,
  drmKeyId,
  violentSegments,
  nuditySegments,
}: MovieVideoPlayerProps) => {
  return (
    <div className="w-full h-full">
      <CustomVideoPlayer
        src={src}
        type={type}
        poster={poster}
        autoPlay={autoPlay}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        movieId={movieId}
        videoId={videoId}
        contentType="movie"
        initialTime={initialTime}
        sprites={sprites}
        vttFiles={vttFiles}
        drmKeyId={drmKeyId}
        violentSegments={violentSegments}
        nuditySegments={nuditySegments}
      />
    </div>
  );
};

export default MovieVideoPlayerComponent;
