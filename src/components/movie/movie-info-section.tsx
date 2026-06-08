"use client";

import { Star, Eye, Calendar, Clock, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { handleDuration } from "../expanding-movie-card";
import Link from "next/link";

interface MovieInfoSectionProps {
  title: string;
  rating: number;
  views: number;
  year: number;
  duration: number;
  ageRating: string;
  genres: string[];
  description: string;
  cast: API.ActorDto[];
  crew: API.DirectorDto[];
  categories: API.CategoryDto[];
}

export function MovieInfoSection({
  title,
  rating,
  views,
  year,
  duration,
  ageRating,
  genres,
  description,
  cast,
  crew,
  categories,
}: MovieInfoSectionProps) {
  // Generate star rating (5 stars total)
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 >= 1;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-4xl font-bold text-white">{title}</h1>

      {/* Rating and Stats */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < fullStars
                    ? "fill-yellow-400 text-yellow-400"
                    : i === fullStars && hasHalfStar
                    ? "fill-yellow-400 text-yellow-400 opacity-50"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="text-2xl font-bold text-white">{rating}</span>
        </div>

        {/* Views */}
        <div className="flex items-center gap-2 text-gray-400">
          <Eye className="w-5 h-5" />
          <span className="text-lg">{views}</span>
        </div>

        {/* Year */}
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-5 h-5" />
          <span className="text-lg">{year}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-5 h-5" />
          <span className="text-lg">{handleDuration(duration)}</span>
        </div>

        {/* Age Rating */}
        <Badge
          variant="secondary"
          className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1 text-sm font-semibold"
        >
          {ageRating}
        </Badge>
      </div>

      {/* Genres */}
      <div className="flex items-center gap-2 flex-wrap">
        {genres.map((genre, index) => (
          <span key={index}>
            <span className="text-white text-base">{genre}</span>
            {index < genres.length - 1 && (
              <span className="text-gray-500 mx-1">•</span>
            )}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="text-gray-300 text-base leading-relaxed">
        {description}
      </div>

      {/* Cast */}
      <div className="flex items-start gap-3">
        <span className="text-white font-semibold min-w-[60px]">Cast:</span>
        <span className="text-white flex flex-wrap gap-1">
          {cast.map((c, index) => (
            <span key={c.id || index}>
              <Link
                href={`/person/${c.id}`}
                className="text-blue-400 hover:underline hover:text-blue-300"
              >
                {c.name}
              </Link>
              {index < cast.length - 1 && <span>, </span>}
            </span>
          ))}
        </span>
      </div>

      {/* Crew */}
      <div className="flex items-start gap-3">
        <span className="text-white font-semibold min-w-[60px]">Crew:</span>
        <span className="text-white flex flex-wrap gap-1">
          {crew.map((c, index) => (
            <span key={c.id || index}>
              <Link
                href={`/person/${c.id}`}
                className="text-blue-400 hover:underline hover:text-blue-300"
              >
                {c.name}
              </Link>
              {index < crew.length - 1 && <span>, </span>}
            </span>
          ))}
        </span>
      </div>

      {/* Categories */}
      <div className="flex items-start gap-3">
        <span className="text-white font-semibold min-w-[60px]">
          Categories:
        </span>
        <span className="text-white flex flex-wrap gap-1">
          {categories.map((c, index) => (
            <span key={c.id || index}>
              <Link
                href={`/movies/type/category/${c.categoryName
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-${c.id}`}
                className="text-blue-400 hover:underline hover:text-blue-300"
              >
                {c.categoryName}
              </Link>
              {index < categories.length - 1 && <span>, </span>}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
