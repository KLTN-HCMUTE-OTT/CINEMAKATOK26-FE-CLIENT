import React, { useState } from "react";
import Image from "next/image";
import { Play, Info, Star } from "lucide-react";
import { PremiumBadge, isPremiumContent } from "@/components/ui/premium-badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MovieCardProps {
  poster: string;
  title: string;
  rating: number;
  accessTier?: string;
  onDetailClick?: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  poster,
  title,
  rating,
  accessTier,
  onDetailClick,
}) => {
  const [imgSrc, setImgSrc] = useState(poster);

  return (
    <Card
      className="group relative w-full h-[25vh] overflow-hidden cursor-pointer transition-all duration-500 shadow-lg hover:shadow-xl"
      onClick={onDetailClick}
      role="button"
      tabIndex={0}
    >
      {/* Poster */}
      <CardHeader className="p-0">
        <div className="absolute inset-0">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImgSrc("/default_banner.jpg")}
          />
        </div>
      </CardHeader>

      {/* Rating Badge */}
      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-white text-xs font-medium">{rating}</span>
      </div>

      {/* Premium Badge */}
      {isPremiumContent(accessTier) && (
        <PremiumBadge
          size="sm"
          showLabel
          className="absolute top-3 right-3 z-10"
        />
      )}

      {/* Title */}
      <CardFooter className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <CardTitle className="text-white font-semibold text-sm md:text-base line-clamp-2">
          {title}
        </CardTitle>
      </CardFooter>
    </Card>
  );
};
