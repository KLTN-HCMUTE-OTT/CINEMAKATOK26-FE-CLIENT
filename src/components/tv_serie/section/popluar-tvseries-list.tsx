"use client";

import { useTVSeriesTrending } from "@/hooks/use-tvseries";
import { SkeletonCard } from "@/components/skeleton-card";
import { TrendingCarousel } from "@/components/trending-carousel";
import { TvSeriesPopularCard } from "../card/tv-series-popular-card";

export function PopularTvSeriesList({}: API.TvSeriesControllerGetTrendingTvSeriesParams) {
  const { result, isLoading } = useTVSeriesTrending({
    limit: 10,
  });
  if (result === null || isLoading) {
    return (
      <section className="px-6 py-8 relative">
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section className="px-6 py-8 relative">
      <TrendingCarousel
        items={result.data || []}
        slidesToShow={4}
        renderCard={(tv_series) => (
          <TvSeriesPopularCard key={tv_series.id} series={tv_series} />
        )}
        title="Popular TV Series"
        showViewAll={true}
        urlNavigate="/tv_series/type/popular"
      />
    </section>
  );
}
