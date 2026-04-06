"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface RankItemProps {
  rank: number;
  poster: string;
  year: number;
  title: string;
  genres: string[];
  id?: string | number;
}

export function RankItem({
  rank,
  poster,
  year,
  title,
  genres,
  id,
}: RankItemProps) {
  const router = useRouter();
  const handleClick = () => {
    if (id) {
      router.push(`/movies/${title}-${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={(e) => {
        e.stopPropagation();
        console.log("MouseDown detected"); // Debug
      }}
      role="button"
      tabIndex={0}
      style={{ pointerEvents: "auto" }} // Force pointer events
      className="flex items-center gap-4 group cursor-pointer hover:bg-slate-800/50 rounded-lg transition-all duration-200 p-3 border-b border-slate-800 last:border-b-0"
    >
      {/* Rank Number */}
      <div className="flex-shrink-0 w-10 text-center">
        <span className="text-4xl font-bold text-white">{rank}</span>
      </div>

      {/* Movie Poster */}
      <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden shadow-lg">
        <Image
          src={poster || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Movie Info */}
      <div className="flex-1 min-w-0">
        <div className="text-gray-400 text-sm mb-1">{year}</div>
        <h3 className="text-white font-bold text-xl mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {genres.map((genre, index) => (
            <span key={index} className="text-blue-400 text-sm font-medium">
              {genre}
              {index < genres.length - 1 && (
                <span className="text-gray-500 mx-1">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
