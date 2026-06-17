"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Sparkles, Flame, Play } from "lucide-react";
import { CustomCarousel } from "./custom-carousel";
import { useRecommendations } from "@/hooks/use-recommendations";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";
import { WatchlistButton } from "@/components/watchlist-button";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendedForYouCardProps {
  id: string;
  contentId: string;
  title: string;
  type: "MOVIE" | "TVSERIES";
  image: string;
  year: string;
  rating?: number;
  duration?: string;
  categories: string[];
  accessTier?: "BASIC" | "PREMIUM";
  matchPercentage?: string | null;
  isAiRecommended: boolean;
}

export function RecommendedForYouCard({
  id,
  contentId,
  title,
  type,
  image,
  year,
  rating,
  duration,
  categories,
  accessTier,
  matchPercentage,
  isAiRecommended,
}: RecommendedForYouCardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(image);

  const handleClick = (e: React.MouseEvent) => {
    // Avoid navigating if clicking on interactive buttons (e.g. WatchlistButton)
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    
    if (type === "MOVIE") {
      router.push(`/movies/${title}-${id}`);
    } else {
      router.push(`/tv_series/${title}-${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex-shrink-0 w-full cursor-pointer select-none"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-md border border-white/5 bg-slate-950">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="320px"
          priority={false}
          onError={() => setImgSrc("/default_banner.jpg")}
        />
        
        {/* Dark Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>

        {/* AI Recommendation / Trending Badge */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isAiRecommended ? (
            <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-purple-500/30 shadow-[0_0_10px_rgba(147,51,234,0.3)]">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              <span>{matchPercentage ? matchPercentage : "AI Choice"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-orange-500/30">
              <Flame className="w-2.5 h-2.5" />
              <span>Trending</span>
            </div>
          )}
        </div>

        {/* Action Badges Top-Right */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          {isPremiumContent(accessTier) && (
            <PremiumBadge size="sm" showLabel={false} className="shadow-md" />
          )}
          <WatchlistButton
            movieId={id}
            contentId={contentId}
            type={type}
            variant="icon"
            size="icon"
            className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white border-none hover:text-orange-400 transition-colors shadow-md backdrop-blur-sm"
          />
        </div>

        {/* Type Badge Bottom-Right */}
        <div className="absolute bottom-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-[10px] font-medium px-1.5 py-0.5 rounded text-gray-300 uppercase tracking-wider">
          {type === "MOVIE" ? "Movie" : "Series"}
        </div>
      </div>

      {/* Info Details */}
      <div className="space-y-1 px-1">
        <h3 className="text-white font-semibold text-base truncate group-hover:text-orange-400 transition-colors" title={title}>
          {title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
          {rating ? (
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          ) : null}
          {rating && (year || duration) ? <span>•</span> : null}
          {year ? <span>{year}</span> : null}
          {year && duration ? <span>•</span> : null}
          {duration ? <span>{duration}</span> : null}
        </div>

        <div className="text-gray-500 text-xs truncate max-w-full">
          {categories.join(" • ")}
        </div>
      </div>
    </div>
  );
}

export function RecommendedForYou() {
  const { result, isLoading, error } = useRecommendations({ limit: 12 });

  if (isLoading) {
    return (
      <section className="px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recommended for You</h2>
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-64 space-y-3 flex-shrink-0">
              <Skeleton className="aspect-video w-full rounded-xl bg-slate-800" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-800 animate-pulse" />
                <Skeleton className="h-3 w-1/2 bg-slate-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !result || !result.recommendations || result.recommendations.length === 0) {
    return null;
  }

  const isAi = result.source === "ai_recommendation";

  const mappedItems = result.recommendations.map((rec) => {
    const item = rec.item;
    const meta = item.metaData || {};
    const year = meta.releaseDate
      ? String(new Date(meta.releaseDate).getFullYear())
      : "";
    const categories = meta.categories
      ? meta.categories.map((c: any) => c.categoryName)
      : [];
    
    // Format duration helper
    let durationStr = "";
    if (rec.type === "MOVIE") {
      if (item.duration) {
        const hrs = Math.floor(item.duration / 60);
        const mins = item.duration % 60;
        durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      }
    } else {
      if (item.totalSeasons) {
        durationStr = `${item.totalSeasons} Season${item.totalSeasons > 1 ? "s" : ""}`;
      }
    }

    // LGB Score Match Percentage
    const matchPercentage = rec.lgbScore
      ? `${Math.min(99, Math.max(60, Math.round(rec.lgbScore * 100)))}% Match`
      : null;

    return {
      id: item.id,
      contentId: meta.id,
      title: meta.title || "",
      type: rec.type,
      image: meta.thumbnail || "/default_banner.jpg",
      year,
      rating: meta.imdbRating || meta.avgRating || 0,
      duration: durationStr,
      categories,
      accessTier: meta.accessTier,
      matchPercentage,
      isAiRecommended: isAi,
    };
  });

  return (
    <section className="px-6 py-8 overflow-hidden">
      <CustomCarousel
        title={isAi ? "Recommended for you" : "Trending for you"}
        items={mappedItems}
        renderCard={(item) => (
          <RecommendedForYouCard key={item.id} {...item} />
        )}
        slidesToShow={4}
        showViewAll={false}
      />
    </section>
  );
}
