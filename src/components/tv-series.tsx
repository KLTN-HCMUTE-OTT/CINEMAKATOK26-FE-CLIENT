"use client";

import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTvSeriesList } from "@/hooks/use-tvseries";

const timeFilters = ["Today", "This Week", "This Month", "This Year"];

const filterMap: Record<string, string> = {
  Today: "today",
  "This Week": "week",
  "This Month": "month",
  "This Year": "year",
};

export function TvSeries() {
  const [activeFilter, setActiveFilter] = useState("Today");
  const router = useRouter();

  const { result, isLoading, error } = useTvSeriesList({
    filter: JSON.stringify({ range: filterMap[activeFilter] }),
  });

  const tvShows = useMemo(() => {
    if (!result?.data) return [];

    return result.data.map((series: any, index: number) => ({
      id: series.id,
      title: series.metaData.title,
      seasons: `${series.totalSeasons} Season${
        series.totalSeasons !== 1 ? "s" : ""
      }`,
      image: series.metaData.thumbnail || "/default_banner.jpg",
      featured: index === 0, // Make the first item featured
    }));
  }, [result]);

  useEffect(() => {
    if (!isLoading && tvShows.length === 0) {
      const currentIndex = timeFilters.indexOf(activeFilter);
      if (currentIndex < timeFilters.length - 1) {
        setActiveFilter(timeFilters[currentIndex + 1]);
      }
    }
  }, [isLoading, tvShows.length, activeFilter]);

  const featuredShow = tvShows.find((show) => show.featured) ?? tvShows[0];
  const otherShows = tvShows.filter((show) => show.id !== featuredShow?.id);

  if (isLoading) {
    return (
      <section className="px-6 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 py-10">
        <div className="text-center text-red-500">
          Error loading TV series: {error}
        </div>
      </section>
    );
  }

  if (!tvShows.length) {
    return (
      <section className="px-6 py-10">
        <div className="text-center text-white">No TV series available</div>
      </section>
    );
  }

  return (
    <section className="px-6 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-white text-3xl font-semibold">TV Series</h2>

        <div className="flex items-center gap-6 text-sm">
          {timeFilters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative font-medium transition-colors pb-1 ${
                  isActive
                    ? "text-[#7C5CFF] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-[#7C5CFF]"
                    : "text-[#6F7286] hover:text-white"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div
          className="group relative overflow-hidden rounded-3xl border border-white/5 transition duration-300 hover:border-white/15 hover:shadow-[0_32px_70px_-20px_rgba(124,92,255,0.35)] cursor-pointer"
          onClick={() =>
            featuredShow &&
            router.push(`/tv_series/${featuredShow.title}-${featuredShow.id}`)
          }
        >
          <div className="relative aspect-[16/9]">
            <Image
              src={featuredShow.image}
              alt={featuredShow.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 60vw, 100vw"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default_banner.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />

            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="text-2xl font-semibold text-white">
                {featuredShow.title}
              </h3>
              <p className="mt-1 text-sm text-white/70">
                {featuredShow.seasons}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {otherShows.map((show) => (
            <div
              key={show.id}
              className="group relative overflow-hidden rounded-2xl border border-white/5 transition duration-300 hover:border-white/15 hover:shadow-[0_24px_60px_-24px_rgba(124,92,255,0.35)] cursor-pointer"
              onClick={() => router.push(`/tv_series/${show.title}-${show.id}`)}
            >
              <div className="group relative w-full h-full overflow-hidden rounded-2xl">
                <Image
                  src={show.image}
                  alt={show.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 100vw"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default_banner.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-semibold text-white">
                    {show.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-white/70">
                    {show.seasons}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
