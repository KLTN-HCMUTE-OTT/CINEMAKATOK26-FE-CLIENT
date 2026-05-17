"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { useMyRoom } from "@/hooks/use-watch-party";
import { extractVideoId } from "@/lib/content-video-resolver";
import { QuickCreateRoomDialog } from "./quick-create-room-dialog";
import type { ContentRef } from "@/types/content-ref";

interface WatchPartyQuickButtonProps {
  content: API.MovieDto | API.EpisodeDto;
  contentType: "movie" | "episode";
  seriesId?: string;
  seriesTitle?: string;
  posterUrl?: string;
  description?: string;
}

export function WatchPartyQuickButton({
  content,
  contentType,
  seriesId,
  seriesTitle,
  posterUrl,
  description,
}: WatchPartyQuickButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: myRoom, isLoading: myRoomLoading } = useMyRoom();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { videoId, reason } = extractVideoId(content);
  const noVideo = !videoId;

  // Build a ContentRef from the content prop
  const buildContentRef = (): ContentRef | null => {
    if (!videoId) return null;

    if (contentType === "movie") {
      const movie = content as API.MovieDto;
      return {
        type: "movie",
        contentId: movie.id,
        videoId,
        title: movie.metaData.title,
        posterUrl: posterUrl ?? movie.metaData.thumbnail,
        description: description ?? movie.metaData.description,
        durationSec: movie.duration * 60,
      };
    }

    const episode = content as API.EpisodeDto;
    const episodeLabel = seriesTitle
      ? `${seriesTitle} — E${episode.episodeNumber}: ${episode.episodeTitle}`
      : episode.episodeTitle;

    return {
      type: "episode",
      contentId: episode.id,
      seriesId,
      videoId,
      title: episodeLabel,
      posterUrl: posterUrl ?? "",
      description: description ?? "",
      durationSec: episode.episodeDuration * 60,
    };
  };

  const tooltipText = noVideo
    ? reason === "VIDEO_NOT_READY"
      ? "Video is being processed"
      : "Video not available yet"
    : undefined;

  // State 1: Not authenticated
  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => router.push("/login")}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
      >
        <Users className="w-4 h-4" />
        Watch Party
      </Button>
    );
  }

  // State 2: User already has an active room → "Continue"
  if (!myRoomLoading && myRoom?.roomId) {
    return (
      <Button
        onClick={() => router.push(`/watch-party/${myRoom.roomId}`)}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold"
      >
        <Play className="w-4 h-4 fill-current" />
        Continue your room
      </Button>
    );
  }

  const contentRef = buildContentRef();

  // State 3: Default — open quick-create dialog
  return (
    <>
      <div className="relative group inline-flex">
        <Button
          disabled={noVideo || myRoomLoading}
          onClick={() => !noVideo && setDialogOpen(true)}
          className={`flex items-center gap-2 rounded-xl font-semibold transition-all ${
            noVideo
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          }`}
          title={tooltipText}
        >
          {myRoomLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Users className="w-4 h-4" />
          )}
          Watch Party
        </Button>

        {noVideo && tooltipText && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltipText}
          </span>
        )}
      </div>

      {contentRef && (
        <QuickCreateRoomDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          contentRef={contentRef}
        />
      )}
    </>
  );
}
