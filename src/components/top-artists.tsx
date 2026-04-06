"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { CustomCarousel } from "./custom-carousel";
import { useTopActors } from "@/hooks/use-actors";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ArtistProps {
  id: string;
  name: string;
  profilePicture: string;
  contentCount?: number;
}
export function ArtistsCard({ artist }: { artist: ArtistProps }) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/person/${artist.id}`);
  };

  return (
    <div
      className="flex flex-col items-center text-center group cursor-pointer w-full"
      onClick={handleClick}
    >
      {/* Artist Image */}
      <div className="relative w-30 h-30 mb-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
        {!imageError && artist.profilePicture ? (
          <Image
            src={artist.profilePicture}
            alt={artist.name}
            fill
            className="object-cover border-2 border-transparent group-hover:border-purple-400 transition-colors"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-white text-4xl font-bold">
            {artist.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <p className="text-white text-lg font-medium line-clamp-2 px-2 w-full">
        {artist.name}
      </p>
    </div>
  );
}

export function TopArtists() {
  const { actors, isLoading, error } = useTopActors({ limit: 10 });
  if (isLoading) {
    return (
      <section className="px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Top Artists</h2>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: "12rem" }}>
              <div className="w-48 h-48 bg-gray-700 rounded-full animate-pulse mb-3" />
              <div className="h-6 bg-gray-700 rounded animate-pulse w-32 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !actors.length) {
    return null;
  }

  return (
    <section className="px-6 py-8 overflow-hidden">
      <CustomCarousel
        items={actors}
        slidesToShow={5}
        renderCard={(item: ArtistProps) => (
          <ArtistsCard key={item.id} artist={item} />
        )}
        title="Top Artists"
        showViewAll={false}
      />
    </section>
  );
}
