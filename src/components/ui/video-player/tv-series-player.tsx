"use client";

import { CustomVideoPlayer } from "./custom-video-player";

export interface TVSeriesVideoPlayerProps {
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
  // TV series specific props
  episodeIndex?: number;
  totalEpisodes?: number;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
}

export const TVSeriesVideoPlayerComponent = ({
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
  episodeIndex,
  totalEpisodes,
  onPrevEpisode,
  onNextEpisode,
}: TVSeriesVideoPlayerProps) => {
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
        initialTime={initialTime}
        sprites={sprites}
        vttFiles={vttFiles}
        // TV series props
        episodeIndexProp={episodeIndex}
        totalEpisodesProp={totalEpisodes}
        onPrevEpisode={onPrevEpisode}
        onNextEpisode={onNextEpisode}
      />
    </div>
  );
};
