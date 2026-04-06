"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Info, X } from "lucide-react";
import { CustomCarousel } from "./custom-carousel";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMovieData } from "@/hooks/use-movies";

interface MovieCardProps {
  id: string;
  title: string;
  year: string;
  duration: string;
  trailer: string;
  imageUrl: string;
  backgroundUrl: string;
  index: number;
  totalCards: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  isTvSeries?: boolean;
}

export const ExpandingMovieCard = ({
  id,
  title,
  year,
  duration,
  trailer,
  imageUrl,
  backgroundUrl,
  index = 0,
  totalCards = 4,
  hoveredIndex,
  onHover,
  isTvSeries = false,
}: MovieCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showTrailer, setShowTrailer] = useState(false);

  const COLLAPSED_WIDTH = 280;
  const EXPANDED_WIDTH = 450;
  const EXPANSION_OFFSET = EXPANDED_WIDTH - COLLAPSED_WIDTH;

  const isHovered = hoveredIndex === index;

  // Xác định điểm giữa: cards từ giữa trở đi sẽ expand sang trái
  const midPoint = Math.ceil(totalCards / 2);
  const expandDirection = index >= midPoint ? "left" : "right";

  // Tính toán transform cho các card khác khi hover
  const getCardTransform = () => {
    if (hoveredIndex === null) return "translateX(0)";

    if (index === hoveredIndex) {
      return expandDirection === "left"
        ? `translateX(-${EXPANSION_OFFSET}px)`
        : "translateX(0)";
    }

    const hoveredMidPoint = Math.ceil(totalCards / 2);
    const hoveredExpandDirection =
      hoveredIndex >= hoveredMidPoint ? "left" : "right";

    if (hoveredExpandDirection === "right") {
      if (index > hoveredIndex) {
        return `translateX(${EXPANSION_OFFSET}px)`;
      }
    } else {
      if (index < hoveredIndex) {
        return `translateX(-${EXPANSION_OFFSET}px)`;
      }
    }

    return "translateX(0)";
  };

  // Lấy video id
  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const videoId = getYouTubeId(trailer);

  return (
    <div
      className={`relative h-[35vh] transition-all duration-500 ease-out ${
        isHovered ? "z-50" : "z-0"
      }`}
      style={{
        width: isHovered ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
        transform: getCardTransform(),
        // Thêm transformOrigin cho container để expand đúng hướng
        transformOrigin:
          expandDirection === "left" ? "right center" : "left center",
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Card */}
      <Card
        className={`
          relative cursor-pointer h-full w-full overflow-hidden rounded-xl shadow-lg
          transition-all duration-500 ease-out
          ${isHovered ? "shadow-2xl" : ""}
        `}
      >
        {/* Ảnh nền (hover) */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${backgroundUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Ảnh mặc định */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Nội dung */}
        <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
          <div
            className={`transition-all duration-300 ${
              isHovered ? "mb-4" : "mb-0"
            }`}
          >
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-gray-300">
              {year}
              {!isTvSeries && ` • ${duration}`}
            </p>
          </div>

          {/* Buttons */}
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <Button
              size="sm"
              className="bg-white/90 text-black hover:bg-white flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowTrailer(true);
              }}
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Trailer
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="bg-gray-800/80 text-white hover:bg-gray-700/80 border border-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  isTvSeries
                    ? `/tv_series/${title}-${id}`
                    : `/movies/${title}-${id}`
                );
              }}
            >
              <Info className="h-4 w-4" />
              Detail
            </Button>
          </div>
        </div>
      </Card>

      {/* Trailer Dialog */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 bg-black border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{title} - Trailer</DialogTitle>
          </DialogHeader>
          <button
            onClick={() => setShowTrailer(false)}
            className="absolute top-4 right-4 z-50 text-white rounded-full bg-black/70 p-3 hover:bg-black/90 transition-all shadow-lg border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full aspect-video">
            {videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>Trailer không khả dụng</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export const handleDuration = (durationInMinutes: number) => {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  return `${hours}h ${minutes}m`;
};
interface MovieListCardProps {
  type: "trending" | "new-release";
  title: string;
  viewAll: boolean;
  slidesToShow?: number;
}

export function MovieListCard({
  type = "trending",
  title,
  viewAll,
  slidesToShow = 5,
}: MovieListCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const {
    result: currentData,
    isLoading: isMovieLoading,
    error: isMovieError,
  } = useMovieData({
    type,
    page: 1,
    limit: 10,
  });

  const transformedMovies = useMemo(() => {
    if (!currentData?.data) return [];
    return currentData.data.map((movie) => ({
      id: movie.id.toString(),
      title: movie.metaData.title,
      year: new Date(movie.metaData.releaseDate).getFullYear().toString(),
      duration: handleDuration(movie.duration || 0),
      trailer: movie.metaData.trailer || "",
      imageUrl: movie.metaData.thumbnail || "/placeholder.jpg",
      backgroundUrl: movie.metaData.banner || "/placeholder.jpg",
    }));
  }, [currentData]);

  return (
    <section className="w-full px-4">
      <CustomCarousel
        items={transformedMovies}
        slidesToShow={slidesToShow}
        renderCard={(movie, index) => (
          <ExpandingMovieCard
            key={movie.id}
            {...movie}
            index={index}
            totalCards={currentData?.meta?.totalItems || 0}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
          />
        )}
        title={title}
        showViewAll={viewAll}
        urlNavigate={
          type === "trending"
            ? "/movies/type/trending"
            : "/movies/type/new-release"
        }
      />
    </section>
  );
}
