export type ExtractVideoIdResult =
  | { videoId: string; reason?: never }
  | { videoId: null; reason: "NO_VIDEO" | "VIDEO_NOT_READY" };

export function extractVideoId(
  content: API.MovieDto | API.EpisodeDto
): ExtractVideoIdResult {
  // EpisodeDto always has a required `video` field
  if ("episodeTitle" in content) {
    return { videoId: content.video.id };
  }

  // MovieDto has optional `video`
  if (!content.video) {
    return { videoId: null, reason: "NO_VIDEO" };
  }

  if (content.video.status === "FAILED" || content.video.status === "PROCESSING") {
    return { videoId: null, reason: "VIDEO_NOT_READY" };
  }

  return { videoId: content.video.id };
}
