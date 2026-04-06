"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieBanner } from "./movie-banner";
import { useMovieData } from "@/hooks/use-movies";

interface BannerCarouselProps {
  autoPlayInterval?: number;
}

export function BannerCarousel({ autoPlayInterval = 0 }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { result, isLoading, error } = useMovieData({
    type: "trending",
    page: 1,
    limit: 5,
  });

  const heroSlides = result?.data || [];

  const handleNext = useCallback(() => {
    if (isAnimating || heroSlides.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, heroSlides.length]);

  const handlePrev = useCallback(() => {
    if (isAnimating || heroSlides.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, heroSlides.length]);

  // Auto play
  useEffect(() => {
    if (autoPlayInterval > 0 && heroSlides.length > 1) {
      const timer = setInterval(handleNext, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [autoPlayInterval, handleNext, heroSlides.length]);

  // Get visible slides (previous, current, next)
  const getVisibleSlides = () => {
    if (heroSlides.length === 0) return [];
    if (heroSlides.length === 1)
      return [{ ...heroSlides[0], position: "center", index: 0 }];

    const prevIndex =
      (currentIndex - 1 + heroSlides.length) % heroSlides.length;
    const nextIndex = (currentIndex + 1) % heroSlides.length;

    return [
      { ...heroSlides[prevIndex], position: "left", index: prevIndex },
      { ...heroSlides[currentIndex], position: "center", index: currentIndex },
      { ...heroSlides[nextIndex], position: "right", index: nextIndex },
    ];
  };

  const visibleSlides = getVisibleSlides();

  return (
    <div className="relative w-full h-[70vh] lg:h-[90vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background blur of current slide */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
          style={{
            backgroundImage: `url(${
              heroSlides[currentIndex]?.metaData.banner || ""
            })`,
          }}
        />
      </div>

      {/* Cards Container */}
      <div className="relative h-full flex items-center justify-center px-4">
        <div className="relative w-full max-w-[1600px] h-full flex items-center justify-center">
          {visibleSlides.map((slide, idx) => {
            const isCenter = slide.position === "center";
            const isLeft = slide.position === "left";
            const isRight = slide.position === "right";

            return (
              <div
                key={`${slide.id}-${slide.index}`}
                className={`
                  absolute transition-all duration-700 ease-out
                  ${isCenter ? "z-30" : "z-10"}
                `}
                style={{
                  transform: `
                    translateX(${isLeft ? "-900px" : isRight ? "900px" : "0"})
                    scale(${isCenter ? 1 : 0.75})
                    rotateY(${isLeft ? "30deg" : isRight ? "-30deg" : "0deg"})
                  `,
                  opacity: isCenter ? 1 : 0.4,
                  pointerEvents: isCenter ? "auto" : "none",
                  filter: isCenter ? "none" : "brightness(0.5)",
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
              >
                {/* Wrapper for non-center slides to handle click */}
                {!isCenter && (
                  <div
                    className="absolute inset-0 z-50 cursor-pointer"
                    style={{ pointerEvents: "auto" }}
                    onClick={() => {
                      if (isLeft) handlePrev();
                      if (isRight) handleNext();
                    }}
                  />
                )}

                <div
                  className={`
                    w-[90vw] max-w-[1600px] transition-all duration-500 h-[70vh] md:h-[75vh]
                    ${
                      isCenter
                        ? "shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50"
                        : "shadow-lg"
                    }
                  `}
                  style={{
                    boxShadow: isCenter
                      ? "0 25px 50px -12px rgba(168, 85, 247, 0.4), 0 0 100px rgba(168, 85, 247, 0.2)"
                      : "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <MovieBanner
                    imageUrl={slide.metaData.banner}
                    title={slide.metaData.title}
                    id={slide.id}
                    buttonText={"Watch Now"}
                  />
                </div>

                {/* Center card additional glow */}
                {isCenter && (
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-lg blur-2xl -z-10 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}
    </div>
  );
}
