"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { tvSeriesControllerGetTvSeriesWithNewEpisodes } from "@/apis/api/tvSeries";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/skeleton-card";
import { CustomCarousel } from "@/components/custom-carousel";
import { useRouter } from "next/navigation";

interface EpisodeCardProps {
  episodeNumber: number;
  title: string;
  imageUrl: string;
  seriesId: string;
  episodeId: string;
  episodeTitle: string;
}

export function InfoEpisodeCard({
  episodeNumber,
  title,
  imageUrl,
  seriesId,
  episodeId,
  episodeTitle,
}: EpisodeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (seriesId && episodeId) {
      router.push(
        `/tv_series/${title}-${seriesId}/episode/${episodeTitle}-${episodeId}`
      );
    }
  };

  const [imgSrc, setImgSrc] = useState(imageUrl || "/default_banner.jpg");

  return (
    <div
      className="relative w-full h-40 rounded-lg overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Background image */}
      <Image
        src={imgSrc}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setImgSrc("/default_banner.jpg")}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

      {/* Text info */}
      <div className="absolute bottom-3 left-3">
        <p className="text-white font-semibold text-sm leading-tight max-w-[80%]">
          {title}
        </p>
        <p className="text-gray-300 text-xs mt-1">EP{episodeNumber}</p>
      </div>
    </div>
  );
}

export function InfoEpisodeCardList() {
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<EpisodeCardProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await tvSeriesControllerGetTvSeriesWithNewEpisodes({
          limit: 10,
          page: 1,
        });

        // Transform dữ liệu ngay khi set state
        const items: EpisodeCardProps[] =
          response.data.data?.map((series: any) => ({
            episodeNumber: series.latestEpisode?.episodeNumber ?? 0,
            title: series.metaData.title,
            imageUrl:
              series.latestEpisode?.video?.thumbnailUrl ||
              "/default_banner.jpg",
            seriesId: series.id,
            episodeId: series.latestEpisode?.id || "",
            episodeTitle: series.latestEpisode?.episodeTitle || "",
          })) || [];

        setEpisodes(items);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách tập phim mới";
        toast.error(message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  return (
    <section className="px-6 py-8 overflow-hidden">
      {loading ? (
        <SkeletonCard />
      ) : episodes.length > 0 ? (
        <CustomCarousel
          title="Featured TV Episodes"
          items={episodes}
          renderCard={(item) => <InfoEpisodeCard {...item} />}
          showViewAll={false}
        />
      ) : (
        <p className="text-white/70">Chưa có tập mới nào</p>
      )}
    </section>
  );
}
