"use client";

import { TrendingCarousel } from "@/components/trending-carousel";
import { PersonMovieCard } from "@/components/person/person-movie-card";
import { use } from "react";
import { useRecommendedMovies } from "@/hooks/use-movies";
import { Spinner } from "../ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingErrorWrapper } from "../loading-error-wrapper";

interface Movie {
  id: string;
  contentId: string;
  title: string;
  imageUrl: string;
  rating: number;
  year: number;
  duration: string;
  description?: string;
  accessTier?: string;
}

interface RecommendedMoviesSectionProps {
  movieId: string;
}

export function RecommendedMoviesSection({
  movieId,
}: RecommendedMoviesSectionProps) {
  const { result, isLoading, error } = useRecommendedMovies({
    page: 1,
    limit: 10,
    movieId,
  } as API.MovieControllerGetRecommendationsByMovieIdParams);

  const recommendedMovies: Movie[] =
    result?.data.map((movie) => ({
      id: movie.id.toString(),
      contentId: movie.metaData.id,
      title: movie.metaData.title,
      imageUrl: movie.metaData.thumbnail || "/placeholder.jpg",
      rating: 0,
      year: new Date(movie.metaData.releaseDate).getFullYear(),
      duration: String(movie.duration),
      description: movie.metaData.description,
      accessTier: movie.metaData.accessTier,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
      </div>

      <LoadingErrorWrapper
        isLoading={isLoading}
        error={error}
        isEmpty={recommendedMovies.length === 0}
        emptyMessage="No recommended movies available."
      >
        <TrendingCarousel
          items={recommendedMovies}
          renderCard={(movie: Movie) => (
            <PersonMovieCard
              id={movie.id}
              contentId={movie.contentId}
              title={movie.title}
              year={movie.year}
              duration={movie.duration}
              image={movie.imageUrl}
              description={movie.description || ""}
              type="movie"
              accessTier={movie.accessTier}
            />
          )}
          slidesToShow={5}
          className="py-4"
        />
      </LoadingErrorWrapper>
    </div>
  );
}
