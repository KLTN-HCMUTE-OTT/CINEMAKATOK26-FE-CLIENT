import { describe, it, expect } from "vitest";
import { extractVideoId } from "@/lib/content-video-resolver";

const baseEntity = { createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" };

const readyVideo: API.VideoDto = {
  ...baseEntity,
  id: "vid-001",
  videoUrl: "https://cdn.example.com/movie.m3u8",
  status: "READY",
  thumbnailUrl: "https://cdn.example.com/thumb.jpg",
  sprites: [],
  vttFiles: [],
};

const processingVideo: API.VideoDto = { ...readyVideo, id: "vid-002", status: "PROCESSING" };

const mockMovie: API.MovieDto = {
  ...baseEntity,
  id: "movie-001",
  duration: 7200,
  video: readyVideo,
  metaData: {
    ...baseEntity,
    id: "content-001",
    type: "MOVIE",
    title: "Inception",
    description: "Mind-bending",
    releaseDate: "2010-07-16",
    maturityRating: "PG-13",
    thumbnail: "https://example.com/thumb.jpg",
    banner: "https://example.com/banner.jpg",
    trailer: "https://example.com/trailer.mp4",
    categories: [],
    tags: [],
    actors: [],
    directors: [],
  },
};

const mockEpisode: API.EpisodeDto = {
  ...baseEntity,
  id: "ep-001",
  episodeNumber: 1,
  episodeDuration: 2760,
  episodeTitle: "Pilot",
  video: readyVideo,
};

describe("extractVideoId", () => {
  it("returns videoId for a movie with READY video", () => {
    const result = extractVideoId(mockMovie);
    expect(result.videoId).toBe("vid-001");
  });

  it("returns null + NO_VIDEO reason for movie without video", () => {
    const movieNoVideo: API.MovieDto = { ...mockMovie, video: undefined };
    const result = extractVideoId(movieNoVideo);
    expect(result.videoId).toBeNull();
    expect(result.reason).toBe("NO_VIDEO");
  });

  it("returns null + VIDEO_NOT_READY for PROCESSING movie video", () => {
    const movie: API.MovieDto = { ...mockMovie, video: processingVideo };
    const result = extractVideoId(movie);
    expect(result.videoId).toBeNull();
    expect(result.reason).toBe("VIDEO_NOT_READY");
  });

  it("returns videoId for an episode (video is required)", () => {
    const result = extractVideoId(mockEpisode);
    expect(result.videoId).toBe("vid-001");
  });
});
