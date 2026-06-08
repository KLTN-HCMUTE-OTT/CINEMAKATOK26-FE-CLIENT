"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CustomCarousel } from "./custom-carousel";
import { useTVSeriesTrending } from "@/hooks/use-tvseries";

interface RecommendedTvShowsProps {
  id: string;
  title: string;
  year: string;
  category: string;
  type: string;
  image: string;
}

export function RecommendedTvShowsCard({
  show,
}: {
  show: RecommendedTvShowsProps;
}) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(show.image || "/default_banner.jpg");
  const handleClick = (show: RecommendedTvShowsProps) => {
    if (show.type === "MOVIE") {
      router.push(`/movies/${show.title}-${show.id}`);
    } else {
      router.push(`/tv_series/${show.title}-${show.id}`);
    }
  };
  return (
    <div
      key={show.id}
      className="group cursor-pointer"
      onClick={() => handleClick(show)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
        <Image
          src={imgSrc}
          alt={show.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgSrc("/default_banner.jpg")}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-white font-semibold text-lg">{show.title}</h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>{show.category}</span>
          <span>•</span>
          <span>{show.year}</span>
        </div>
      </div>
    </div>
  );
}

export function RecommendedTvShows() {
  const { result, isLoading } = useTVSeriesTrending({
    limit: 10,
  });

  if (isLoading || !result?.data || result.data.length === 0) {
    return null;
  }

  const recommendedShows = result.data.map((show: any) => ({
    id: show.id,
    title: show.metaData.title,
    year: String(new Date(show.metaData.releaseDate).getFullYear() || ""),
    category: show.metaData.categories.map((cat: any) => cat.categoryName).join(" • "),
    type: show.metaData.type,
    image: show.metaData.thumbnail || "/default_banner.jpg",
  }));

  return (
    <section className="px-6 py-8">
      <CustomCarousel
        title="Recommended for You"
        items={recommendedShows}
        renderCard={(item) => (
          <RecommendedTvShowsCard key={item.id} show={item} />
        )}
        showViewAll={true}
      />
    </section>
  );
}
