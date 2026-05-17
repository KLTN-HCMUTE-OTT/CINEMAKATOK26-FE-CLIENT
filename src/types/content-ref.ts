export interface ContentRef {
  type: "movie" | "episode";
  contentId: string;
  seriesId?: string;
  videoId: string;
  title: string;
  posterUrl: string;
  description: string;
  durationSec?: number;
}
