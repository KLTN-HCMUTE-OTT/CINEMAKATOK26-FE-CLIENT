"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrendingMovieCard } from "./trending-movie-card";
import { TrendingCarousel } from "./trending-carousel";
import { useAllMovies, useTrendingMovies } from "@/hooks/use-movies";

export function TrendingMoviesList({
  page,
  limit,
  sort,
  search,
}: API.MovieControllerFindAllParams) {
  const { result, isLoading, error, refetch } = useTrendingMovies({
    page,
    limit,
    sort,
    search,
  });
  if (isLoading || error || !result) {
    return null;
  }
  return (
    <section className="px-6 py-8 relative">
      {isLoading && <div>Loading...</div>}
      <TrendingCarousel
        items={result.data}
        slidesToShow={5}
        renderCard={(movie) => (
          <TrendingMovieCard key={movie.id} movie={movie} />
        )}
        title="Trending Movies"
        showViewAll={true}
        urlNavigate="/movies/type/trending"
      />
    </section>
  );
}
