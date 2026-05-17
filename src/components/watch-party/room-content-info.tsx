"use client";

import { useState } from "react";
import Image from "next/image";
import { Film, Tv, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { ContentRef } from "@/types/content-ref";

interface RoomContentInfoProps {
  contentRef: ContentRef;
}

export function RoomContentInfo({ contentRef }: RoomContentInfoProps) {
  const [expanded, setExpanded] = useState(false);
  const TRUNCATE_AT = 200;
  const longDesc =
    contentRef.description && contentRef.description.length > TRUNCATE_AT;

  const detailHref =
    contentRef.type === "movie"
      ? `/movies/${contentRef.contentId}`
      : contentRef.seriesId
      ? `/tv_series/${contentRef.seriesId}/episode/${contentRef.contentId}`
      : null;

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-start gap-3">
        {/* Poster */}
        {contentRef.posterUrl && (
          <div className="relative flex-none w-12 h-16 rounded overflow-hidden bg-gray-800 shadow-md">
            <Image
              src={contentRef.posterUrl}
              alt={contentRef.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold mb-1 ${
              contentRef.type === "movie"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-purple-500/15 text-purple-400"
            }`}
          >
            {contentRef.type === "movie" ? (
              <><Film className="w-2.5 h-2.5" /> Movie</>
            ) : (
              <><Tv className="w-2.5 h-2.5" /> Episode</>
            )}
          </span>

          {/* Title */}
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {contentRef.title}
          </p>

          {/* Duration */}
          {contentRef.durationSec && contentRef.durationSec > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {Math.round(contentRef.durationSec / 60)} min
            </p>
          )}

          {/* Link to detail page */}
          {detailHref && (
            <a
              href={detailHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
            >
              View page <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Description (collapsible) */}
      {contentRef.description && (
        <div>
          <p className="text-xs text-gray-400 leading-relaxed">
            {expanded || !longDesc
              ? contentRef.description
              : contentRef.description.slice(0, TRUNCATE_AT) + "…"}
          </p>
          {longDesc && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mt-1 transition-colors"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> More</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Compact header variant — used inside RoomLayout header bar
   ──────────────────────────────────────────────────────────── */

interface RoomContentCompactProps {
  contentRef: ContentRef;
  onExpand: () => void;
}

export function RoomContentCompact({
  contentRef,
  onExpand,
}: RoomContentCompactProps) {
  return (
    <button
      onClick={onExpand}
      className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
      title={contentRef.title}
    >
      {contentRef.posterUrl && (
        <div className="relative flex-none w-5 h-7 rounded overflow-hidden bg-gray-700">
          <Image
            src={contentRef.posterUrl}
            alt={contentRef.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <span className="text-xs text-gray-300 truncate max-w-[120px]">
        {contentRef.title}
      </span>
    </button>
  );
}
