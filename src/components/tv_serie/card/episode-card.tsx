import { Grid, List } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Combobox } from "@/components/ui/combobox";

interface EpisodeCardProps {
  episode: API.EpisodeDto;
  onClick?: () => void;
  selected?: boolean;
}

export function EpisodeCard({ episode, onClick, selected }: EpisodeCardProps) {
  const [imgSrc, setImgSrc] = useState(
    episode.video.thumbnailUrl || "/default_banner.jpg"
  );

  return (
    <div
      onClick={onClick}
      className={`flex w-full h-28 rounded-xl overflow-hidden transition-colors duration-200 cursor-pointer ${
        selected ? "bg-[#2A214F]" : "bg-[#1A1F37] hover:bg-[#2A314F]"
      }`}
    >
      {/* LEFT IMAGE */}
      <div className="relative w-40 h-full flex-shrink-0">
        <Image
          src={imgSrc}
          alt={episode.episodeTitle}
          fill
          className="object-cover"
          onError={() => setImgSrc("/default_banner.jpg")}
        />
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex flex-col justify-center px-4">
        <p className="text-xs text-gray-300 mb-1">EP{episode.episodeNumber}</p>
        <p className="text-white font-semibold text-sm leading-tight max-w-[240px]">
          {episode.episodeTitle}
        </p>
      </div>
    </div>
  );
}

interface EpisodeCardListProps {
  tvSeriesName?: string;
  tvSeriesId?: string;
  season: API.SeasonDto[];
  initialView?: "grid" | "list";
  selectedIndex?: number;
  selectedEpisodeId?: string; // New prop for current episode ID
  onSelect?: (index: number) => void;
  title?: string;
}

export function EpisodeCardList({
  tvSeriesName = "series",
  tvSeriesId = "1",
  season,
  initialView = "grid",
  selectedIndex,
  selectedEpisodeId, // New prop
  onSelect,
}: EpisodeCardListProps) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">(initialView);
  const [selected, setSelected] = useState<number>(selectedIndex || 0);
  const [selectedSeason, setSelectedSeason] = useState(season[0]?.id);
  const optionsSeason = season.map((season) => ({
    label: `Season ${season.seasonNumber}`,
    value: season.id,
  }));
  const currentSeason = season.find((season) => season.id === selectedSeason);

  // Calculate selected index and season based on selectedEpisodeId
  useEffect(() => {
    if (selectedEpisodeId && season.length > 0) {
      // Find which season contains the selected episode
      for (const seasonItem of season) {
        const episodeIndex = seasonItem.episodes.findIndex(
          (ep) => ep.id === selectedEpisodeId
        );
        if (episodeIndex !== -1) {
          setSelectedSeason(seasonItem.id);
          setSelected(episodeIndex);
          break;
        }
      }
    }
  }, [selectedEpisodeId, season]);

  const handleSelect = (index: number) => {
    const ep = season.find((s) => s.id === selectedSeason)?.episodes[index];
    setSelected(index);
    if (onSelect) {
      onSelect(index);
      return;
    }
    if (ep?.id !== undefined && ep?.id !== null) {
      router.push(
        `/tv_series/${tvSeriesName}-${tvSeriesId}/episode/${ep.episodeTitle}-${ep.id}`
      );
    }
  };

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">{tvSeriesName}</h3>

          <Combobox
            value={selectedSeason}
            onChange={setSelectedSeason}
            options={optionsSeason}
            placeholder="Select Season"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            className={`p-2 rounded-md ${
              view === "grid"
                ? "bg-[#2A214A]"
                : "bg-transparent hover:bg-[#262938]"
            }`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`p-2 rounded-md ${
              view === "list"
                ? "bg-[#2A214A]"
                : "bg-transparent hover:bg-[#262938]"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "grid" ? (
        <div className="grid grid-cols-6 gap-3">
          {currentSeason?.episodes.map((ep, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={ep.id ?? i}
                onClick={() => handleSelect(i)}
                className={`relative rounded-md h-12 flex items-center justify-center text-sm font-semibold transition ${
                  isSelected
                    ? "bg-purple-600 text-white"
                    : "bg-[#2A314F] text-gray-200 hover:bg-[#3a4164]"
                }`}
              >
                <span className="pointer-events-none">
                  {" "}
                  {ep.episodeNumber}{" "}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-2">
          {currentSeason?.episodes.map((ep, i) => (
            <EpisodeCard
              key={ep.id ?? i}
              episode={ep}
              onClick={() => handleSelect(i)}
              selected={selected === i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
