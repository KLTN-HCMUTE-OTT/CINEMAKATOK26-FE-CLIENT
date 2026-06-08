/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { use, useEffect, useState } from "react";
import { ExpandingMovieCard, handleDuration } from "../expanding-movie-card";
import { favoriteControllerGetFavorites } from "@/apis/api/favorites";
import { LoadingErrorWrapper } from "../loading-error-wrapper";
import { CustomCarousel } from "../custom-carousel";

export function FavoriteMovies() {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await favoriteControllerGetFavorites();
        setData(response.data.data);
      } catch (error) {
        setError("Failed to fetch favorite movies");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transformedMovies = data.map((movie: unknown) => ({
    id: (movie as any).id.toString(),
    movieId: (movie as any).movieId?.toString() || null,
    tvSeriesId: (movie as any).tvSeriesId?.toString() || null,
    title: (movie as any).title,
    year: new Date((movie as any).releaseDate).getFullYear().toString(),
    duration: handleDuration((movie as any).duration || 0),
    trailer: (movie as any).trailer || "",
    imageUrl: (movie as any).thumbnail || "/placeholder.jpg",
    backgroundUrl: (movie as any).banner || "/placeholder.jpg",
  }));

  return (
    <div className="flex space-x-4 overflow-x-hidden">
      <LoadingErrorWrapper isLoading={loading} error={error}>
        <CustomCarousel
          items={transformedMovies}
          renderCard={(item, index) => (
            <ExpandingMovieCard
              key={item.id}
              {...item}
              id={item.movieId || item.tvSeriesId || item.id}
              index={index}
              totalCards={data.length || 0}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
              isTvSeries={!!item.tvSeriesId}
            />
          )}
          slidesToShow={4}
          loop={true}
          className="px-6 py-4"
          showViewAll={true}
          title={"Favorite Movies"}
        />
      </LoadingErrorWrapper>
    </div>
  );
}
