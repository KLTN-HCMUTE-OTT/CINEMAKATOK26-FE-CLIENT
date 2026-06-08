"use client";

import { Film, Tv } from "lucide-react";

export type ContentType = "movie" | "tv";

interface ContentTypeTabsProps {
  active: ContentType;
  onChange: (type: ContentType) => void;
}

export function ContentTypeTabs({ active, onChange }: ContentTypeTabsProps) {
  return (
    <div className="flex border-b border-white/10">
      <button
        onClick={() => onChange("movie")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
          active === "movie"
            ? "text-purple-400 border-b-2 border-purple-500"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <Film className="w-4 h-4" />
        Movies
      </button>
      <button
        onClick={() => onChange("tv")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
          active === "tv"
            ? "text-purple-400 border-b-2 border-purple-500"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <Tv className="w-4 h-4" />
        TV Series
      </button>
    </div>
  );
}
