import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useState } from "react";

interface TVSeriesCardProps {
  id: string;
  title: string;
  genres: {
    categoryName: string;
    id: string;
  }[];
  imageUrl: string;
}

export const TVSeriesCard: React.FC<TVSeriesCardProps> = ({
  id,
  title,
  genres,
  imageUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(imageUrl || "/default_banner.jpg");

  const createSlug = (title: string, id: string) => {
    return `${title.replace(/\s+/g, "-").toLowerCase()}-${id}`;
  };

  const detailPageUrl = `/tv_series/${createSlug(title, id)}`;

  return (
    <div
      className="relative w-full h-56 bg-black rounded-xl overflow-hidden shadow-lg 
                 transition-transform duration-300 hover:scale-[1.03] cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={detailPageUrl} className="block w-full h-full">
        {/* TOP — Image (chiếm 70% chiều cao) */}
        <div className="relative w-full h-[70%]">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImgSrc("/default_banner.jpg")}
          />

          {/* Always bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>

        {/* BOTTOM — Text */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 bg-black/40 backdrop-blur-sm">
          <h3 className="text-white text-base font-semibold line-clamp-1 hover:text-purple-400 transition">
            {title}
          </h3>

          <p className="text-white/70 text-xs line-clamp-1">
            {genres.map((genre, index) => (
              <span key={genre.id}>
                <span
                  className="hover:text-purple-400 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/tv_series/type/category/${genre.categoryName}-${genre.id}`;
                  }}
                >
                  {genre.categoryName}
                </span>
                {index < genres.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity duration-300 
          ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-full p-4 mb-3">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
          <p className="text-white text-lg font-semibold">Play Now</p>
        </div>
      </Link>
    </div>
  );
};

interface TvSeriesListProps {
  tvSeries: TVSeriesCardProps[];
}

export function TvSeriesList({ tvSeries }: TvSeriesListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tvSeries.map((tv) => (
        <TVSeriesCard key={tv.id} {...tv} />
      ))}
    </div>
  );
}
