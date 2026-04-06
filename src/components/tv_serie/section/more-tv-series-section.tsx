"use client";

import { tvSeriesControllerGetRecommendations } from "@/apis/api/tvSeries";
import { useEffect, useState } from "react";
import { CustomCarousel } from "@/components/custom-carousel";
import { TVSeriesCard } from "./tv-series-list";
interface MoreTVSeriesSectionProps {
  tvSeriesId: string;
}
export function MoreTVSeriesSection({ tvSeriesId }: MoreTVSeriesSectionProps) {
  const [data, setData] = useState<API.TVSeriesSummaryDto[]>([]);
  useEffect(() => {
    const fetchMoreTVSeries = async () => {
      try {
        const response = await tvSeriesControllerGetRecommendations({
          id: tvSeriesId,
          page: 1,
          limit: 10,
        });
        setData(response.data.data); // Assuming the response has an 'items' array
      } catch (error) {
        console.error("Error fetching more TV series:", error);
      }
    };

    fetchMoreTVSeries();
  }, [tvSeriesId]);
  return (
    <section className="px-6 py-8 overflow-hidden">
      <CustomCarousel
        title="More TV Series"
        items={data}
        renderCard={(item) => (
          <TVSeriesCard
            id={item.id}
            title={item.metaData.title}
            imageUrl={item.metaData.thumbnail || "/placeholder-tvseries.jpg"}
            genres={item.metaData.categories.map((ct) => ({
              categoryName: ct.categoryName,
              id: ct.id,
            }))}
          />
        )}
      />
    </section>
  );
}
