"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MovieDetailHeroVideo } from "@/components/movie/movie-detail-hero-video";
import { MovieInfoSection } from "@/components/movie/movie-info-section";
import { RecommendedMoviesSection } from "@/components/movie/recommended-movies-section";
import { ReviewsSection } from "@/components/movie/reviews-section";
import { moviesControllerGetMovieById } from "@/apis/api/movies";
import { contentsControllerIncreaseViewCount } from "@/apis/api/contents";
import { ActionsProvider, useActions } from "@/contexts/movie-actions-context";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { LoadingErrorWrapper } from "@/components/loading-error-wrapper";
import { ButtonAction } from "@/components/ui/button-action";

interface Props {
  params: Promise<{ id: string }>;
}

// Separate component that uses the context
function MoviePageContent({ movieId }: { movieId: string | undefined }) {
  //  State management
  const [movieData, setMovieData] = useState<API.MovieDtoResponseDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View count state
  const [viewCount, setViewCount] = useState<number>(0);

  //  Use shared state from context
  const {
    isFavorite: isFavorited,
    totalFavorites,
    isFavoriteLoading,
    toggleFavorite: handleFavoriteToggle,
    isInWatchlist,
    isWatchlistLoading,
    toggleWatchlist,
  } = useActions();

  //  Fetch movie data
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await moviesControllerGetMovieById({ id: movieId });

        if (response?.data) {
          setMovieData(response.data);
          setViewCount(response.data.data.metaData.viewCount || 0);
          console.log("Movie data loaded:", {
            movieId,
            videoId: response.data.data.video?.id,
            videoUrl: response.data.data.video?.videoUrl,
            hasVideo: !!response.data.data.video,
          });
        } else {
          setError("Không tìm thấy dữ liệu phim");
        }
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError(
          err instanceof Error ? err.message : "Lỗi khi tải dữ liệu phim"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);
  //  Extract movie data safely
  const movie = movieData?.data;
  const metaData = movie?.metaData;

  //  Increase view count when page loads
  useEffect(() => {
    const increaseViewCount = async () => {
      if (!metaData?.id) return;

      try {
        await contentsControllerIncreaseViewCount({
          id: metaData.id,
        });
        // Tăng view count locally sau khi API thành công
        setViewCount((prev) => prev + 1);
        console.log("View count increased for content:", metaData.id);
      } catch (err) {
        console.error("Error increasing view count:", err);
        // Không hiển thị error cho user vì đây là background operation
      }
    };

    increaseViewCount();
  }, [metaData?.id]); //  Chỉ chạy một lần khi có metaData.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />

      <LoadingErrorWrapper
        isLoading={isLoading}
        error={error}
        isEmpty={!movie || !metaData}
        emptyMessage="Không tìm thấy thông tin phim"
      >
        {/*  Chỉ render khi có movie và metaData */}
        {movie && metaData && (
          <>
            <MovieDetailHeroVideo
              title={metaData.title}
              backdropUrl={metaData.banner || "/placeholder.jpg"}
              posterUrl={metaData.thumbnail || "/placeholder.jpg"}
              trailerUrl={metaData.trailer || ""}
              videoSources={{
                url: movie.video?.videoUrl || "",
                type: "application/x-mpegURL",
              }}
              movieId={movieId}
              videoId={movie.video?.id || ""}
            />

            <main className="container mx-auto px-4 py-8 space-y-12">
              {/* Movie Detail Layout - Poster + Info */}
              <div className="flex gap-8 items-start">
                {/* Left: Poster - Sticky */}
                <div className="flex-shrink-0 w-[25vw] space-y-5 sticky top-4 self-start">
                  {/* Poster */}
                  <div className="relative group overflow-hidden rounded-2xl shadow-2xl aspect-[2/3]">
                    <Image
                      src={metaData.thumbnail || "/placeholder.jpg"}
                      alt={metaData.title}
                      fill
                      className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Action Buttons */}
                  <ButtonAction
                    isFavorited={isFavorited}
                    isFavoriteLoading={isFavoriteLoading}
                    handleFavoriteToggle={handleFavoriteToggle}
                    totalFavorites={totalFavorites}
                    isInWatchlist={isInWatchlist}
                    isWatchlistLoading={isWatchlistLoading}
                    toggleWatchlist={toggleWatchlist}
                    shareTitle={metaData.title}
                    shareDescription={metaData.description}
                    shareUrl={
                      typeof window !== "undefined" ? window.location.href : ""
                    }
                    shareThumbnail={metaData.thumbnail}
                  />
                </div>
                {/* Right: Movie Info, Recommended & Reviews */}
                <div className="flex-1 space-y-12">
                  <MovieInfoSection
                    title={metaData.title}
                    rating={metaData.imdbRating || 0}
                    views={metaData.viewCount || viewCount}
                    year={
                      metaData.releaseDate
                        ? parseInt(metaData.releaseDate.split("-")[0])
                        : new Date().getFullYear()
                    }
                    duration={movie.duration}
                    ageRating={metaData.maturityRating || "N/A"}
                    genres={
                      metaData.categories?.map((c) => c.categoryName) || []
                    }
                    description={metaData.description}
                    cast={metaData.actors || []}
                    crew={metaData.directors || []}
                    categories={metaData.categories || []}
                  />

                  {/* Recommended Movies */}
                  <RecommendedMoviesSection movieId={movieId || ""} />

                  {/* Reviews Section */}
                  <ReviewsSection />
                </div>
              </div>
            </main>
          </>
        )}
      </LoadingErrorWrapper>

      <Footer />
    </div>
  );
}

// Main component with Provider
export default function MoviePage({ params }: Props) {
  const { id } = use(params);
  let movieId: string | undefined;

  // Nếu slug chứa UUID
  if (id.includes("-")) {
    const parts = id.split("-");
    const possibleUUID = parts.slice(-5).join("-");
    if (
      possibleUUID.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      movieId = possibleUUID;
    }
  }

  // Get contentId from initial fetch (we need this for the Provider)
  const [initialContentId, setInitialContentId] = useState<string>("");

  useEffect(() => {
    const fetchContentId = async () => {
      if (!movieId) return;

      try {
        const response = await moviesControllerGetMovieById({ id: movieId });
        if (response?.data?.data?.metaData?.id) {
          setInitialContentId(response.data.data.metaData.id);
        }
      } catch (err) {
        console.error("Error fetching contentId:", err);
      }
    };

    fetchContentId();
  }, [movieId]);

  // Don't render until we have contentId
  if (!initialContentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <ActionsProvider contentId={initialContentId}>
      <MoviePageContent movieId={movieId} />
    </ActionsProvider>
  );
}
