"use client";

import { useQuery } from "@tanstack/react-query";
import { videosControllerGetVideoById } from "@/apis/api/videos";
import { getRoomContentRef } from "@/lib/watch-party-content-cache";
import { queryKeys } from "@/lib/query-keys";
import type { ContentRef } from "@/types/content-ref";

interface RoomContentResult {
  contentRef: ContentRef | null;
  isLoading: boolean;
}

export function useRoomContent(
  roomId: string,
  videoId: string
): RoomContentResult {
  // First, try the localStorage cache (set by the host at creation time)
  const cached = getRoomContentRef(roomId);

  // Only call the video API if there's no cache hit
  const { data: videoData, isLoading } = useQuery({
    queryKey: queryKeys.watchParty.content(videoId),
    queryFn: async () => {
      const res = await videosControllerGetVideoById({ id: videoId });
      return res.data?.data ?? null;
    },
    enabled: !cached && Boolean(videoId),
    staleTime: 5 * 60 * 1000,
  });

  if (cached) {
    return { contentRef: cached, isLoading: false };
  }

  if (videoData) {
    // Fallback: build a minimal ContentRef from the video object alone
    const fallback: ContentRef = {
      type: "movie",
      contentId: videoId,
      videoId,
      title: "",
      posterUrl: videoData.thumbnailUrl ?? "",
      description: "",
    };
    return { contentRef: fallback, isLoading: false };
  }

  return { contentRef: null, isLoading };
}
