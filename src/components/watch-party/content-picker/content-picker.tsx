"use client";

import { useState } from "react";
import { ContentTypeTabs, type ContentType } from "./content-type-tabs";
import { ContentSearchList } from "./content-search-list";
import { EpisodePicker } from "./episode-picker";
import { extractVideoId } from "@/lib/content-video-resolver";
import type { ContentRef } from "@/types/content-ref";

type Step = "search" | "episode";

interface ContentPickerProps {
  onConfirm: (ref: ContentRef) => void;
  onCancel: () => void;
}

export function ContentPicker({ onConfirm, onCancel }: ContentPickerProps) {
  const [tab, setTab] = useState<ContentType>("movie");
  const [step, setStep] = useState<Step>("search");
  const [selectedSeries, setSelectedSeries] =
    useState<API.TVSeriesSummaryDto | null>(null);

  const handleTabChange = (type: ContentType) => {
    setTab(type);
    setStep("search");
    setSelectedSeries(null);
  };

  const handlePickMovie = (movie: API.MovieDto) => {
    const { videoId } = extractVideoId(movie);
    if (!videoId) return;

    const ref: ContentRef = {
      type: "movie",
      contentId: movie.id,
      videoId,
      title: movie.metaData.title,
      posterUrl: movie.metaData.thumbnail,
      description: movie.metaData.description,
      durationSec: movie.duration * 60,
    };
    onConfirm(ref);
  };

  const handlePickSeries = (series: API.TVSeriesSummaryDto) => {
    setSelectedSeries(series);
    setStep("episode");
  };

  const handlePickEpisodeRef = (ref: ContentRef) => {
    onConfirm(ref);
  };

  const handleBack = () => {
    setStep("search");
    setSelectedSeries(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar — hide when in episode picker */}
      {step === "search" && (
        <ContentTypeTabs active={tab} onChange={handleTabChange} />
      )}

      <div className="flex-1 overflow-hidden">
        {step === "search" && (
          <ContentSearchList
            contentType={tab}
            onPickMovie={handlePickMovie}
            onPickSeries={handlePickSeries}
          />
        )}

        {step === "episode" && selectedSeries && (
          <EpisodePicker
            series={selectedSeries}
            onPick={handlePickEpisodeRef}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Footer cancel */}
      <div className="flex-none border-t border-white/8 px-4 py-3">
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
