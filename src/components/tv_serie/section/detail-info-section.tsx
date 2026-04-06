import { ArtistsCard } from "@/components/top-artists";
import Link from "next/link";

interface DetailInfoSectionProps {
  metaData: API.ContentDto;
}

export const DetailInfoSection = ({ metaData }: DetailInfoSectionProps) => {
  const actors = metaData.actors.map((actor) => ({
    id: actor.id,
    name: actor.name,
    profilePicture: actor.profilePicture,
  }));

  const directors = metaData.directors.map((director) => ({
    id: director.id,
    name: director.name,
    profilePicture: director.profilePicture,
  }));

  return (
    <div className="px-6 py-8">
      <h2 className="text-base font-semibold text-gray-300 mb-2">
        About this Show
      </h2>
      <h1 className="text-3xl font-bold text-white mb-3">{metaData.title}</h1>
      <p className="text-lg text-gray-300 mb-5">{metaData.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-4">
        <ul className="flex flex-wrap items-center gap-3">
          {metaData.categories.map((ct) => {
            const slug = ct.categoryName.toLowerCase().replace(/\s+/g, "-");
            const url = `/tv_series/type/category/${slug}-${ct.id}`;
            return (
              <li key={ct.id} className="inline">
                <Link
                  href={url}
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-purple-400/10"
                >
                  {ct.categoryName}
                </Link>
              </li>
            );
          })}
        </ul>
        <span className="text-gray-500 select-none">·</span>
        <span className="text-gray-400">
          {metaData.releaseDate?.split("-")[0]}
        </span>
      </div>

      {/* Cast Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
          Cast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {actors.map((actor) => (
            <ArtistsCard key={actor.id} artist={actor} />
          ))}
        </div>
      </div>

      {/* Directors Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          Directors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {directors.map((director) => (
            <ArtistsCard key={director.id} artist={director} />
          ))}
        </div>
      </div>
    </div>
  );
};
