"use client";

import { CustomCarousel } from "./custom-carousel";
import { MovieCard } from "./movie-card";
import { useRouter } from "next/navigation";
import { useMovieData } from "@/hooks/use-movies";
import { useMemo } from "react";

interface MovieListProps {
  type?: "trending" | "new-release" | "popular" | "top-rated" | "all";
  title?: string;
}

export default function MovieList({ type, title }: MovieListProps) {
  const router = useRouter();
  //  Xử lý type và sort
  const isTopRated = type === "top-rated";
  const movieType = isTopRated ? "all" : type || "all";
  const sortParam = isTopRated ? { avgRating: "DESC" } : undefined;

  const { result } = useMovieData({
    type: movieType,
    page: 1,
    limit: 10,
    sort: JSON.stringify(sortParam), //  Thêm sort param
  });

  const transformedMovies = useMemo(() => {
    if (!result?.data) return [];
    return result.data.map((movie) => ({
      id: movie.id.toString(),
      poster: movie.metaData.thumbnail || "/placeholder.jpg",
      title: movie.metaData.title,
      rating: movie.metaData.avgRating || 0,
    }));
  }, [result]);

  return (
    <CustomCarousel
      items={transformedMovies}
      renderCard={(item) => (
        <MovieCard
          key={item.id}
          {...item}
          onDetailClick={() => router.push(`/movies/${item.title}-${item.id}`)}
        />
      )}
      slidesToShow={4}
      loop={true}
      className="px-6 py-4"
      showViewAll={true}
      title={title}
      urlNavigate={
        type === "trending"
          ? "/movies/type/trending"
          : type === "new-release"
          ? "/movies/type/new-release"
          : "/movies/type/all"
      }
    />
  );
}
