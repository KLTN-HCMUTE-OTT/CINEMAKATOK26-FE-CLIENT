"use client";

import { ChevronRight } from "lucide-react";
import { ReleaseCard } from "./new-release-card";
import { CustomCarousel } from "./custom-carousel";
import { useNewReleaseMovies } from "@/hooks/use-movies";

export function NewReleases({
  page,
  limit,
  sort,
  search,
}: API.MoviesControllerGetNewReleaseMoviesParams) {
  const { result, isLoading, error, refetch } = useNewReleaseMovies({
    page,
    limit,
    sort,
    search,
  });
  if (isLoading || error || !result) {
    return null;
  }
  if (result.data.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-8 overflow-hidden relative">
      <CustomCarousel
        items={result?.data || []}
        slidesToShow={5}
        renderCard={(item) => <ReleaseCard key={item.id} movie={item} />}
        title="New Releases"
        showViewAll={true}
        urlNavigate="/movies/type/new-release"
      />
    </section>
  );
}
