"use client";

import React, { useState } from "react";
import Image from "next/image";
import { OctagonAlert, Plus } from "lucide-react";
import { CustomCarousel } from "./custom-carousel";
import { useRouter } from "next/navigation";

interface MovieCardProps {
  movieId?: string;
  title: string;
  year: number;
  duration: string;
  description: string;
  imageUrl: string;
}

export const MovieSlideCard: React.FC<MovieCardProps> = ({
  movieId,
  title,
  year,
  duration,
  description,
  imageUrl,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (id?: string) => {
    if (!id) return;
    router.push(`/movies/${title}-${id}`);
  };

  return (
    <div
      className="relative w-64 h-96 rounded-2xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="w-full h-full object-cover"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Title - hidden when hovered */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 z-10 transition-opacity duration-300 ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        <h3 className="text-white font-bold text-xl">{title}</h3>
      </div>

      {/* Hover Overlay - Slides in from right */}
      <div
        className={`absolute inset-0 bg-[#0a0e27] transform transition-transform duration-500 ease-out ${
          isHovered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col justify-between h-full p-6 overflow-hidden">
          {/* Top Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <h3 className="text-white font-bold text-2xl mb-3">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {year} · {duration}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">
              {description}
            </p>
          </div>

          {/* Bottom Buttons */}
          <div className="flex-shrink-0 space-y-3">
            <button
              onClick={() => handleClick(movieId)}
              className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold py-3 px-4 rounded-xl hover:bg-white hover:text-[#0a0e27] transition-colors duration-300"
            >
              <OctagonAlert className="w-5 h-5" />
              Details
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold py-3 px-4 rounded-xl hover:bg-white hover:text-[#0a0e27] transition-colors duration-300"
            >
              <Plus className="w-5 h-5" />
              Add to My List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MovieSlideListProps {
  movieId?: string;
}
export default function MovieSlideList({ movieId }: MovieSlideListProps) {
  // Mock data - Replace with real data fetching logic
  const movies = [
    {
      movieId: "1",
      title: "Inception",
      year: 2010,
      duration: "2h 28m",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      imageUrl: "/best-friend-poster.jpg",
    },
    {
      movieId: "2",
      title: "The Dark Knight",
      year: 2008,
      duration: "2h 32m",
      description:
        "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
      imageUrl: "/the-post-movie-poster.jpg",
    },
    {
      movieId: "3",
      title: "Inception",
      year: 2010,
      duration: "2h 28m",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      imageUrl: "/best-friend-poster.jpg",
    },
    {
      movieId: "4",
      title: "The Dark Knight",
      year: 2008,
      duration: "2h 32m",
      description:
        "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
      imageUrl: "/the-post-movie-poster.jpg",
    },
  ];

  return (
    <div className="flex  space-x-4 py-4">
      <CustomCarousel
        items={movies}
        renderCard={(movie) => (
          <MovieSlideCard key={movie.movieId} {...movie} />
        )}
        title="Recommend For You"
        slidesToShow={4}
        loop={false}
        className=""
        showViewAll={false}
      />
    </div>
  );
}
