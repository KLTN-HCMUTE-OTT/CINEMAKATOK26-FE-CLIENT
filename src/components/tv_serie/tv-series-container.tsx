"use client";
import { useState } from "react";
import { ReviewsSection } from "../movie";
import { DetailInfoSection } from "./section/detail-info-section";
import { EpisodeSection } from "./section/episode-section";

const tabs = [
  { key: "episodes", label: "Episodes" },
  { key: "detail", label: "Detail" },
  { key: "reviews", label: "Reviews" },
];
interface TVSeriesTabsContainerProps {
  tvSeries: API.TVSeriesDto;
}

export default function TVSeriesTabsContainer({
  tvSeries,
}: TVSeriesTabsContainerProps) {
  const [activeTab, setActiveTab] = useState("episodes");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-800 mb-6 mt-3 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 font-semibold text-lg transition ${
              activeTab === tab.key
                ? "text-white border-b-2 border-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "episodes" && (
        <EpisodeSection
          items={tvSeries.seasons}
          tvSeriesName={tvSeries.metaData.title}
          tvSeriesId={tvSeries.id}
        />
      )}
      {activeTab === "detail" && (
        <DetailInfoSection metaData={tvSeries.metaData} />
      )}
      {activeTab === "reviews" && (
        <div className="px-6 py-8">
          <ReviewsSection />
        </div>
      )}
    </div>
  );
}
