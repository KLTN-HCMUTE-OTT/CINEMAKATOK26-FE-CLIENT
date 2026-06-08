"use client";
import { Star, Eye, MessageSquare } from "lucide-react";
import { useState } from "react";

interface MovieInfoProps {
  title: string;
  rating: number;
  views: number;
  comments: number;
  year: number;
  duration: string;
  maturity: string;
  genres: string[];
  description: string;
  cast: string[];
  crew: string[];
}

export default function MovieOverview({
  title,
  rating,
  views,
  comments,
  year,
  duration,
  maturity,
  genres,
  description,
  cast,
  crew,
}: MovieInfoProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-white">
      {/* Title */}
      <h1 className="text-5xl font-bold mb-4">{title}</h1>

      {/* Rating + Views + Comments */}
      <div className="flex items-center gap-4 mb-4">
        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-purple-500 text-purple-500" />
          ))}
        </div>
        {/* Rating */}
        <span className="text-lg font-semibold">{rating}</span>
        {/* Views */}
        <div className="flex items-center gap-2 text-gray-300">
          <Eye className="w-5 h-5" />
          <span>{views} Views</span>
        </div>
        {/* Comments */}
        <div className="flex items-center gap-2 text-gray-300">
          <MessageSquare className="w-5 h-5" />
          <span>{comments}</span>
        </div>
      </div>

      {/* Year - Duration - Maturity */}
      <div className="flex items-center gap-3 text-gray-400 text-base mb-3">
        <span>{year}</span>
        <span>•</span>
        <span>{duration}</span>
        <span className="bg-[#23253a] text-white text-sm px-3 py-1 rounded font-semibold">
          {maturity}
        </span>
      </div>

      {/* Genres */}
      <div className="flex items-center gap-3 text-gray-300 text-base mb-6">
        {genres.map((g, idx) => (
          <span key={idx}>{g}</span>
        ))}
      </div>

      {/* Description */}
      <p className="text-gray-300 text-base leading-relaxed mb-2">
        {expanded ? description : description.slice(0, 180) + "...."}
      </p>
      <button
        className="text-purple-400 hover:text-purple-300 font-medium mb-6"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show Less" : "Show More"}
      </button>

      {/* Cast & Crew */}
      <div className="text-gray-300 space-y-2 text-base">
        <p>
          <span className="font-semibold text-orange-500">Cast:</span>{" "}
          <span className="text-gray-400">{cast.join(", ")}</span>
        </p>
        <p>
          <span className="font-semibold text-orange-500">Crew:</span>{" "}
          <span className="text-gray-400">{crew.join(", ")}</span>
        </p>
      </div>
    </div>
  );
}
