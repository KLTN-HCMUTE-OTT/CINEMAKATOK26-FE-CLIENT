"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PersonHeroProps {
  name: string;
  profileImage?: string;
  biography?: string;
}

export function PersonHero({
  name,
  profileImage = "/placeholder.svg",
  biography = "",
}: PersonHeroProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 300; // Maximum characters to show before truncating
  if (biography === null) biography = "";
  const shouldTruncate = biography.length > MAX_LENGTH;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Biography</h2>
      <div className="text-gray-300 leading-relaxed">
        {biography ? (
          <>
            <p className={isExpanded ? "" : "line-clamp-none"}>
              {shouldTruncate && !isExpanded
                ? `${biography.substring(0, MAX_LENGTH)}...`
                : biography}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-white font-bold cursor-pointer flex items-center gap-1 transition-colors hover:text-purple-400"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">
            No biography available for this person.
          </p>
        )}
      </div>
    </div>
  );
}
