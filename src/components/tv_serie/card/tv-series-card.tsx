/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TvSeriesFilter } from "@/components/tv_serie/tv-series-filter";
import { CustomCarousel } from "@/components/custom-carousel";
import { useTvSeriesList } from "@/hooks/use-tvseries";

interface TvSeriesCardProps {
  id: string;
  imageUrl: string;
  title: string;
  totalSeasons: number;
}

export function TvSeriesCard({
  id,
  imageUrl,
  title,
  totalSeasons,
}: TvSeriesCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || "/default_banner.jpg");
  const router = useRouter();
  return (
    <div
      className="w-[18vw] flex-shrink-0 rounded-lg overflow-hidden bg-black cursor-pointer"
      onClick={() => router.push(`/tv_series/${title}-${id}`)}
    >
      <div className="relative h-[15vh] w-full hover:scale-105 transition-transform duration-300 ease-in-out">
        <img
          src={imgSrc}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setImgSrc("/default_banner.jpg")}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate hover:text-purple-500">
          {title}
        </h3>
        <p className="text-sm text-white/70">{totalSeasons} Seasons</p>
      </div>
    </div>
  );
}

export function TvSeriesCardList() {
  const [filter, setFilter] = useState<string>("today");
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);

  const { result, isLoading, error } = useTvSeriesList({
    filter: JSON.stringify({ range: filter }),
  });

  const items = useMemo(() => {
    return (
      result?.data.map((serie: any) => ({
        id: serie.id,
        imageUrl: serie.metaData.thumbnail,
        title: serie.metaData.title,
        totalSeasons: serie.totalSeasons,
      })) || []
    );
  }, [result]);

  // Cập nhật displayData khi có data mới với timeout
  useEffect(() => {
    if (!isLoading) {
      // Đợi ít nhất 500ms để tránh nhấp nháy quá nhanh
      const timeout = setTimeout(() => {
        if (items.length > 0) {
          setDisplayData(items);
        }
        setIsTransitioning(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, items]);

  // Bắt đầu transition khi thay đổi filter
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setIsTransitioning(true);
  };

  return (
    <section className="px-6 py-8 overflow-hidden">
      <TvSeriesFilter active={filter} onChange={handleFilterChange} />
      {error && <p className="text-red-500">Error loading TV series.</p>}

      {isTransitioning && (
        <div className="flex justify-center items-center h-[250px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!isTransitioning && displayData.length > 0 && (
        <CustomCarousel
          title="TV Series"
          items={displayData}
          renderCard={(item) => <TvSeriesCard key={item.id} {...item} />}
          showViewAll={true}
          slidesToShow={5}
        />
      )}

      {!isLoading && !isTransitioning && items.length === 0 && !error && (
        <p className="text-white mt-4">
          No TV series found for the selected filter.
        </p>
      )}
    </section>
  );
}
