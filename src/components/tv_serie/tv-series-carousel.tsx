"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react"; // Thêm icon
import { Skeleton } from "../ui/skeleton";
import { useTVSeriesTrending } from "@/hooks/use-tvseries";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { WatchlistButton } from "@/components/watchlist-button";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
type TvSeriesCarouselItem = {
  id: string;
  contentId: string;
  title: string;
  description: string;
  releaseYear: string;
  seasons: string;
  backgroundImage: string;
};

const InlineBannerContent = ({
  id,
  contentId,
  title,
  description,
  releaseYear,
  seasons,
  backgroundImage,
}: TvSeriesCarouselItem) => {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    backgroundImage || "/default_banner.jpg"
  );

  const handleClick = () => {
    router.push(`/tv_series/${title}-${id}`);
  };
  // Đã thêm padding và kích thước font responsive (p-6 md:p-12, text-3xl md:text-5xl, v.v.)
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12 text-white bg-gradient-to-t from-black/90 via-black/50 to-transparent">
      <Image
        src={imgSrc}
        alt={title}
        fill
        className="object-cover z-0"
        onError={() => setImgSrc("/default_banner.jpg")}
      />
      <div className="relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">{title}</h2>
        <p className="text-sm md:text-lg w-full md:w-3/4 mb-4 md:mb-6 line-clamp-2 md:line-clamp-3">
          {description}
        </p>
        <div className="flex items-center gap-2 md:gap-4 mb-4">
          {/* Sử dụng props responsive cho Button (size="sm" md:size="lg") */}
          <Button
            size={"sm"}
            className="bg-white text-black hover:bg-white/90 z-101"
            onClick={handleClick}
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 fill-black" />
            Play Now
          </Button>
          <WatchlistButton
            movieId={id}
            contentId={contentId}
            type="TVSERIES"
            variant="default"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20"
          />
        </div>
        {/* Ẩn thông tin phụ trên mobile để gọn gàng hơn */}
        <div className="hidden md:flex items-center gap-4 text-sm text-neutral-300">
          <span>{releaseYear}</span>
          <span>•</span>
          <span>{seasons} Seasons</span>
          <span className="border border-neutral-400 px-1.5 rounded-sm">
            CC
          </span>
        </div>
      </div>
    </div>
  );
};

// ======================================

// === COMPONENT CHÍNH: CAROUSEL ===
const TvSeriesCarousel = () => {
  const { result, isLoading } = useTVSeriesTrending({
    limit: 5,
  });

  const items: TvSeriesCarouselItem[] = useMemo(() => {
    if (!result?.data) return [];

    return result.data.map((series) => ({
      // Dùng 'any' nếu hook của bạn không rõ type
      id: series.id,
      contentId: series.metaData.id,
      title: series.metaData.title,
      description: series.metaData.description || "",
      releaseYear: series.metaData.releaseDate
        ? new Date(series.metaData.releaseDate).getFullYear().toString()
        : "N/A",
      seasons: series.totalSeasons ? series.totalSeasons.toString() : "0",
      backgroundImage: series.metaData.thumbnail || "/default-banner.jpg",
    }));
  }, [result]);

  // State để quản lý image sources với error handling
  const [imageSources, setImageSources] = useState<Record<string, string>>({});

  const loading = isLoading;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize image sources when items change
  useEffect(() => {
    const newImageSources: Record<string, string> = {};
    items.forEach((item) => {
      newImageSources[item.id] = item.backgroundImage;
    });
    setImageSources(newImageSources);
  }, [items]);

  const handleImageError = (itemId: string) => {
    setImageSources((prev) => ({
      ...prev,
      [itemId]: "/default_banner.jpg",
    }));
  };

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!items.length) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((prev) => (prev >= items.length ? 0 : prev));
  }, [items.length]);

  const transitionDuration = 700; // ms

  const next = () => {
    if (!isTransitioning && items.length) {
      setIsTransitioning(true);
      setActiveIndex((prev) => (prev + 1) % items.length);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    }
  };

  const prev = () => {
    if (!isTransitioning && items.length) {
      setIsTransitioning(true);
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    }
  };

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== activeIndex) {
      setIsTransitioning(true);
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    }
  };

  // Hàm tính toán style 3D/2D cho mỗi card
  const getCardStyle = (index: number): React.CSSProperties => {
    if (!items.length) return {};

    const offset = index - activeIndex;
    const [translateX, translateZ, rotateY, opacity, zIndex, scale] =
      calculateCardTransforms(offset, items.length, isMobile);

    return {
      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      transition: `all ${transitionDuration}ms ease-in-out`,
      transformStyle: "preserve-3d" as const,
    };
  };

  // Hàm logic tính toán transform (đã bao gồm xử lý responsive)
  const calculateCardTransforms = (
    offset: number,
    totalItems: number,
    isMobile: boolean
  ) => {
    // Xử lý vòng lặp
    let normalizedOffset = offset;
    if (offset < -totalItems / 2) {
      normalizedOffset = offset + totalItems;
    } else if (offset > totalItems / 2) {
      normalizedOffset = offset - totalItems;
    }

    // Logic Responsive
    if (isMobile) {
      // Trên Mobile: Trượt ngang 1-item
      if (normalizedOffset === 0) {
        // Active
        return [0, 0, 0, 1, 30, 1]; // [translateX, translateZ, rotateY, opacity, zIndex, scale]
      }
      if (normalizedOffset === 1) {
        // Next
        return [100, 0, 0, 0, 0, 1];
      }
      if (normalizedOffset === -1) {
        // Prev
        return [-100, 0, 0, 0, 0, 1];
      }
      // Các card ẩn khác
      return [Math.sign(normalizedOffset) * 100, 0, 0, 0, 0, 1];
    } else {
      // Trên Desktop: Hiệu ứng 3D "Cover Flow"
      const baseScale = 0.85;
      const baseOpacity = 0.6;
      const baseZIndex = 10;
      const baseTranslateX = 45; // %
      const baseTranslateZ = -200; // px
      const baseRotateY = 30; // deg

      if (normalizedOffset === 0) {
        // Active
        return [0, 0, 0, 1, 30, 1];
      }
      if (normalizedOffset === 1) {
        // Next
        return [
          baseTranslateX,
          baseTranslateZ,
          -baseRotateY,
          baseOpacity,
          baseZIndex,
          baseScale,
        ];
      }
      if (normalizedOffset === -1) {
        // Prev
        return [
          -baseTranslateX,
          baseTranslateZ,
          baseRotateY,
          baseOpacity,
          baseZIndex,
          baseScale,
        ];
      }
      // Các card ẩn khác
      const sign = Math.sign(normalizedOffset);
      return [sign * 100, -500, sign * 45, 0, 0, 0.7];
    }
  };

  if (!loading && !items.length) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-black/50 to-transparent">
      {loading && (
        <div className="w-full px-4 md:px-8 py-8 md:py-12">
          <Skeleton className="h-[50vh] md:h-[600px] w-full rounded-3xl" />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="relative h-[50vh] md:h-[650px] px-4 md:px-8 py-8 md:py-12">
          {/* Carousel Container */}
          <div
            className="relative h-full flex items-center justify-center"
            style={{ perspective: isMobile ? "none" : "1000px" }}
          >
            {/* Div cha cho các card, chiều rộng responsive */}
            <div
              className="relative w-full md:w-[60%] h-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="absolute w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
                  style={getCardStyle(index)}
                  onClick={
                    !isMobile // Chỉ cho phép click đổi slide trên desktop
                      ? () => goToSlide(index)
                      : undefined
                  }
                >
                  <Image
                    src={imageSources[item.id] || "/default_banner.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={index === activeIndex}
                    onError={() => handleImageError(item.id)}
                  />
                  {/* Nội dung banner */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      opacity: index === activeIndex ? 1 : 0,
                    }}
                  >
                    <InlineBannerContent
                      id={item.id}
                      contentId={item.contentId}
                      title={item.title}
                      description={item.description}
                      releaseYear={item.releaseYear}
                      seasons={item.seasons}
                      backgroundImage={item.backgroundImage}
                    />
                  </div>
                  {/* Lớp phủ tối cho card không active (chỉ trên desktop) */}
                  {!isMobile && (
                    <div
                      className="absolute inset-0 bg-black/50 transition-opacity duration-500"
                      style={{
                        opacity: index === activeIndex ? 0 : 1,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls - Đã di chuyển vào trong và responsive */}
          {items.length > 1 && (
            <div className="absolute bottom left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-6 z-40">
              {/* Prev Button */}
              <button
                aria-label="Previous"
                onClick={prev}
                disabled={isTransitioning}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => goToSlide(index)}
                    disabled={isTransitioning}
                    className={`rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-6 h-1.5 md:w-8 md:h-2 bg-white shadow-lg shadow-white/50"
                        : // Kích thước responsive
                          "w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 hover:bg-white/60 hover:scale-125"
                    } disabled:cursor-not-allowed`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                aria-label="Next"
                onClick={next}
                disabled={isTransitioning}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TvSeriesCarousel;
