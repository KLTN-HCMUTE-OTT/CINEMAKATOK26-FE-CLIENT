"use client";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { Combobox } from "@/components/ui/combobox";
import { CustomCarousel } from "@/components/custom-carousel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { de } from "date-fns/locale";

interface EpisodeProps {
  imageUrl: string;
  episodeNumber: number | string;
  title: string;
  duration: string;
  onClick?: () => void;
}

export default function EpisodeCard({
  imageUrl,
  episodeNumber,
  title,
  duration,
  onClick,
}: EpisodeProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || "/default_banner.jpg");

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover w-full h-full"
          onError={() => setImgSrc("/default_banner.jpg")}
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-white text-sm font-medium">
          <PlayCircle className="w-5 h-5" />
          {duration}
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-400 mb-1">EP{episodeNumber}</div>
        <div className="font-bold text-lg mb-1 text-white">{title}</div>
      </div>
    </div>
  );
}

interface EpisodeSectionProps {
  items: API.SeasonDto[];
  tvSeriesName?: string;
  tvSeriesId?: string;
}

export function EpisodeSection({
  items,
  tvSeriesName,
  tvSeriesId,
}: EpisodeSectionProps) {
  const router = useRouter();
  const [selectedSeason, setSelectedSeason] = useState(items[0]?.id);
  const optionsSeason = items.map((season) => ({
    label: `Season ${season.seasonNumber}`,
    value: season.id,
  }));

  // Lấy season đang chọn
  const currentSeason = items.find((season) => season.id === selectedSeason);

  const handleEpisodeClick = (episode: API.EpisodeDto) => {
    if (tvSeriesName && tvSeriesId && episode.id) {
      router.push(
        `/tv_series/${tvSeriesName}-${tvSeriesId}/episode/${episode.episodeTitle}-${episode.id}`
      );
    } else {
      // Fallback: try to navigate with episode ID only
      console.warn("Missing tvSeriesName or tvSeriesId for navigation");
    }
  };

  return (
    <section className="px-6 py-8 overflow-hidden">
      <Combobox
        value={selectedSeason}
        onChange={setSelectedSeason}
        options={optionsSeason}
        placeholder="Select Season"
      />
      <CustomCarousel
        items={currentSeason?.episodes || []}
        renderCard={(item) => (
          <EpisodeCard
            imageUrl={item.video.thumbnailUrl}
            episodeNumber={item.episodeNumber}
            title={item.episodeTitle}
            duration={item.episodeDuration.toString()}
            onClick={() => handleEpisodeClick(item)}
          />
        )}
        showViewAll={false}
        slidesToShow={5}
      />
    </section>
  );
}
