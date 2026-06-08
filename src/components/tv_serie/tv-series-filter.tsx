"use client";

import React from "react";
const TV_SERIES_FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];
interface Props {
  active: string;
  onChange: (value: string) => void;
}

export function TvSeriesFilter({ active, onChange }: Props) {
  return (
    <div className="flex justify-end items-center gap-6 text-sm mb-6">
      {TV_SERIES_FILTERS.map(({ label, value }) => {
        const isActive = active === value;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`relative font-medium transition-colors pb-1 ${
              isActive
                ? "text-[#7C5CFF] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-[#7C5CFF]"
                : "text-[#6F7286] hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
