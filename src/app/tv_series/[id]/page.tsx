"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { contentsControllerIncreaseViewCount } from "@/apis/api/contents";
import { ActionsProvider, useActions } from "@/contexts/movie-actions-context";
import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { LoadingErrorWrapper } from "@/components/loading-error-wrapper";
import { tvSeriesControllerGetTvSeriesById } from "@/apis/api/tvSeries";
import TvSeriesBanner from "@/components/tv_serie/card/tv-series-banner";
import { MoreTVSeriesSection } from "@/components/tv_serie/section/more-tv-series-section";
import TVSeriesTabsContainer from "@/components/tv_serie/tv-series-container";
import { useTvSeriesDetail } from "@/hooks/use-tvseries";

interface Props {
  params: Promise<{ id: string }>;
}

// Separate component that uses the context
function TVSeriesPageContent({
  tvSeriesId,
}: {
  tvSeriesId: string | undefined;
}) {
  //  State management
  const [tvSeriesData, setTVSeriesData] =
    useState<API.TVSeriesDtoResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //  View count state
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
      if (!tvSeriesId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await tvSeriesControllerGetTvSeriesById({
          id: tvSeriesId,
        });

        if (response?.data) {
          setTVSeriesData(response.data);
          setViewCount(response.data.data.metaData.viewCount || 0);
        } else {
          setError("Không tìm thấy dữ liệu phim");
        }
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError(
          err instanceof Error ? err.message : "Lỗi khi tải dữ liệu phim",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (tvSeriesId) {
      fetchMovieData();
    }
  }, [tvSeriesId]);
  //  Extract movie data safely
  const tvSeries = tvSeriesData?.data;
  const metaData = tvSeries?.metaData;

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
        isEmpty={!tvSeries || !metaData}
        emptyMessage="Không tìm thấy thông tin phim"
      >
        {/*  Chỉ render khi có movie và metaData */}
        {tvSeries && metaData && (
          <div>
            <TvSeriesBanner
              id={tvSeries.id}
              title={metaData.title}
              description={metaData.description}
              genres={metaData.categories.map((ct) => ({
                id: ct.id,
                categoryName: ct.categoryName,
              }))}
              year={new Date(metaData.releaseDate).getFullYear().toString()}
              seasons={tvSeries.seasons.length}
              episodeId={tvSeries.seasons[0]?.episodes[0]?.id || ""}
              episodeTitle={
                tvSeries.seasons[0]?.episodes[0]?.episodeTitle || ""
              }
              viewCount={viewCount}
              bannerUrl={metaData.thumbnail}
              trailerUrl={metaData.trailer}
              isFavorited={isFavorited}
              totalFavorites={totalFavorites}
              isFavoriteLoading={isFavoriteLoading}
              handleFavoriteToggle={handleFavoriteToggle}
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

            <TVSeriesTabsContainer tvSeries={tvSeries} />
            <MoreTVSeriesSection tvSeriesId={tvSeries.id} />
          </div>
        )}
      </LoadingErrorWrapper>

      <Footer />
    </div>
  );
}

// Main component with Provider
export default function TVSeriesPage({ params }: Props) {
  const { id } = use(params);
  let tvSeriesId: string | undefined;

  // Nếu slug chứa UUID
  if (id.includes("-")) {
    const parts = id.split("-");
    const possibleUUID = parts.slice(-5).join("-");
    if (
      possibleUUID.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      tvSeriesId = possibleUUID;
    }
  }

  const { result, isLoading, error } = useTvSeriesDetail(tvSeriesId);
  const resolvedContentId = result?.metaData?.id || result?.id || "";

  // Keep spinner only while detail request is in-flight
  if (isLoading && !resolvedContentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center px-4 text-center text-red-300">
        Cannot load TV Series information. Please try again later.
      </div>
    );
  }

  if (!tvSeriesId || !result || !resolvedContentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center px-4 text-center text-gray-200">
        TV Series not found.
      </div>
    );
  }

  return (
    <ActionsProvider contentId={resolvedContentId}>
      <TVSeriesPageContent tvSeriesId={tvSeriesId} />
    </ActionsProvider>
  );
}
