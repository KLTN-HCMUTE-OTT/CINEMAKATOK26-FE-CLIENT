"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TrendingCarouselProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  title?: string;
  slidesToShow?: number;
  loop?: boolean;
  className?: string;
  showViewAll?: boolean;
  urlNavigate?: string;
}

// Wrapper component để handle hover state và z-index
function CarouselItemWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const itemRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);

    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const scaledWidth = rect.width * 1.25;
      const rightEdge = rect.right + (scaledWidth - rect.width) / 2;

      if (rightEdge > viewportWidth) {
        const overflow = rightEdge - viewportWidth + 50;
        setTranslateX(-overflow);
      } else {
        const leftEdge = rect.left - (scaledWidth - rect.width) / 2;
        if (leftEdge < 0) {
          setTranslateX(Math.abs(leftEdge) + 20);
        }
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTranslateX(0);
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        zIndex: isHovered ? 100 : 1,
        transform: `translateX(${translateX}px)`,
        transition: "transform 0.3s ease, z-index 0s",
      }}
    >
      {children}
    </div>
  );
}

export function TrendingCarousel<T>({
  items,
  renderCard,
  title,
  slidesToShow = 5,
  loop = false,
  className = "",
  showViewAll = false,
  urlNavigate,
}: TrendingCarouselProps<T>) {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const handleViewAllClick = () => {
    if (urlNavigate) {
      console.log("Navigating to:", urlNavigate);
      router.push(urlNavigate);
    }
  };

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Calculate slide width based on slidesToShow
  const getSlideWidthClass = () => {
    switch (slidesToShow) {
      case 1:
        return "basis-full";
      case 2:
        return "basis-1/2 md:basis-1/2";
      case 3:
        return "basis-1/2 md:basis-1/3";
      case 4:
        return "basis-1/2 md:basis-1/3 lg:basis-1/4";
      case 5:
        return "basis-1/2 md:basis-1/3 lg:basis-1/5";
      case 6:
        return "basis-1/2 md:basis-1/4 lg:basis-1/6";
      default:
        return "basis-1/2 md:basis-1/3 lg:basis-1/5";
    }
  };

  return (
    <div className={cn("w-full relative", className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {showViewAll && (
          <button
            className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium z-101"
            onClick={handleViewAllClick}
          >
            View All
          </button>
        )}
      </div>

      {/* Carousel Container with padding for hover expansion */}
      <div className="relative">
        {/* Outer wrapper với overflow-x hidden để clip cards bên phải */}
        <div
          style={{
            overflowX: "hidden",
            overflowY: "visible",
            paddingTop: "4rem",
            paddingBottom: "4rem",
            marginTop: "-4rem",
            marginBottom: "-4rem",
          }}
        >
          {/* Container với overflow visible để card có thể thoát ra theo chiều dọc */}
          <div
            style={{
              overflow: "visible",
              position: "relative",
            }}
          >
            {/* Embla Viewport */}
            <div
              ref={emblaRef}
              style={{
                overflow: "visible",
              }}
            >
              {/* Embla Container */}
              <div className="flex -ml-2 md:-ml-4 touch-pan-y">
                {items.map((item, index) => (
                  <CarouselItemWrapper
                    key={index}
                    className={cn(
                      "min-w-0 shrink-0 grow-0 pl-2 md:pl-4",
                      getSlideWidthClass()
                    )}
                  >
                    <div className="relative w-full h-full overflow-visible">
                      {renderCard(item, index)}
                    </div>
                  </CarouselItemWrapper>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {canScrollPrev && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 size-10 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
        )}

        {canScrollNext && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-50 size-10 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
        )}
      </div>
    </div>
  );
}
