"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Play, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MovieHoverCardProps {
  id: string;
  poster: string;
  title: string;
  year: number;
  duration: string;
  rating: number;
  description: string;
  actors: string[];
  crew: string[];
  genres: string[];
}

export default function MovieHoverCard({
  id,
  poster,
  title,
  year,
  duration,
  rating,
  description,
  actors,
  crew,
  genres,
}: MovieHoverCardProps) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [placement, setPlacement] = useState<"left" | "right">("right");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hover && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const overlayWidth = 580;
      const spaceRight = window.innerWidth - rect.right;
      setPlacement(spaceRight < overlayWidth ? "left" : "right");
    }
  }, [hover]);

  return (
    <div
      ref={cardRef}
      className="relative w-full group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* --- Default Card --- */}
      <Card className="overflow-hidden rounded-xl shadow-md border-none h-full ">
        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-xl">
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 rounded-t-xl"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/40 to-transparent">
            <h3 className="text-white font-semibold text-base line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-gray-400">{genres.join(" • ")}</p>
          </div>
        </div>
      </Card>

      {/* --- Hover Overlay --- */}
      {hover && (
        <div
          className={`absolute top-6 ${
            placement === "right" ? "left-full" : "right-full"
          } w-[20vw] h-[45vh] bg-[#181818] rounded-2xl shadow-2xl z-20 flex overflow-hidden transition-all duration-300`}
        >
          {/* Right - Info */}
          <div className="flex-1 p-5 flex flex-col justify-between text-white">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-black font-bold text-xs px-2 py-1 rounded">
                  IMDb
                </span>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  {rating}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold">{title}</h2>
              <span className="text-gray-400 text-xs">
                {year} • {duration}
              </span>

              {/* Description */}
              <p className="text-gray-300 text-sm mt-3 line-clamp-3 font-arial">
                {description}
              </p>

              {/* Cast */}
              <div className="mt-3 space-y-1 text-sm text-gray-400">
                <p className="text-sm text-gray-400 mt-2">
                  <span className="font-semibold text-white">Actor:</span>{" "}
                  {actors.map((actor, index) => (
                    <span key={actor}>
                      <Link
                        href={`/actors/${encodeURIComponent(actor)}`}
                        className="text-gray-300 hover:text-purple-400 hover:underline transition-colors duration-200"
                      >
                        {actor}
                      </Link>
                      {index < actors.length - 1 && ", "}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  <span className="font-semibold text-white">Crew:</span>{" "}
                  {crew.map((member, index) => (
                    <span key={member}>
                      <Link
                        href={`/actors/${encodeURIComponent(member)}`}
                        className="text-gray-300 hover:text-purple-400 hover:underline transition-colors duration-200"
                      >
                        {member}
                      </Link>
                      {index < actors.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button className="flex items-center gap-2 bg-purple-600 text-white text-sm px-4 py-2 rounded-full hover:bg-purple-700 transition-all shadow-lg">
                <Play className="w-4 h-4" /> Trailer
              </button>
              <button
                onClick={() => router.push(`/movies/${id}`)}
                className="flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all border border-white/10"
              >
                <Info className="w-4 h-4" /> Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MovieHoverCardListProps {
  movies: MovieHoverCardProps[];
}

export function MovieHoverCardList({ movies }: MovieHoverCardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieHoverCard key={movie.id} {...movie} />
      ))}
    </div>
  );
}
