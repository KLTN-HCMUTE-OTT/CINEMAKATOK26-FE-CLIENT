"use client";

import { useQuery } from "@tanstack/react-query";
import { tvSeriesControllerGetTvSeriesById } from "@/apis/api/tvSeries";
import { ChevronDown, ChevronRight, Clock, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import type { ContentRef } from "@/types/content-ref";

interface EpisodePickerProps {
  series: API.TVSeriesSummaryDto;
  onPick: (ref: ContentRef) => void;
  onBack: () => void;
}

export function EpisodePicker({ series, onPick, onBack }: EpisodePickerProps) {
  const [openSeason, setOpenSeason] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["content-picker", "series-detail", series.id],
    queryFn: async () => {
      const res = await tvSeriesControllerGetTvSeriesById({ id: series.id });
      return res.data?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handlePickEpisode = (
    episode: API.EpisodeDto,
    seasonNumber: number
  ) => {
    const ref: ContentRef = {
      type: "episode",
      contentId: episode.id,
      seriesId: series.id,
      videoId: episode.video.id,
      title: `${series.metaData.title} — S${seasonNumber} E${episode.episodeNumber}: ${episode.episodeTitle}`,
      posterUrl: series.metaData.thumbnail,
      description: series.metaData.description,
      durationSec: episode.episodeDuration * 60,
    };
    onPick(ref);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Loading episodes…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
        <AlertCircle className="w-8 h-8 text-red-400/60" />
        <p className="text-sm text-red-400">Failed to load episodes</p>
      </div>
    );
  }

  const seasons = [...data.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);

  return (
    <div className="flex flex-col h-full">
      {/* Series header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <span className="text-sm font-semibold text-white truncate">
          {series.metaData.title}
        </span>
        <span className="ml-auto flex-none text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
          {seasons.length} season{seasons.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Season accordion */}
      <div className="flex-1 overflow-y-auto">
        {seasons.map((season) => {
          const key = season.id;
          const isOpen = openSeason === key || (openSeason === null && seasons.length === 1);

          return (
            <div key={key}>
              {/* Season header */}
              <button
                onClick={() => setOpenSeason(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <span className="text-sm font-semibold text-gray-200">
                  Season {season.seasonNumber}
                </span>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-xs">{season.totalEpisodes} ep</span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Episodes */}
              {isOpen && (
                <div>
                  {[...season.episodes]
                    .sort((a, b) => a.episodeNumber - b.episodeNumber)
                    .map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => handlePickEpisode(ep, season.seasonNumber)}
                        className="w-full flex items-start gap-3 px-6 py-2.5 text-left hover:bg-purple-500/10 transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="flex-none text-xs text-gray-600 mt-0.5 w-8 text-right">
                          E{ep.episodeNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{ep.episodeTitle}</p>
                          {ep.episodeDuration > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {ep.episodeDuration} min
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
