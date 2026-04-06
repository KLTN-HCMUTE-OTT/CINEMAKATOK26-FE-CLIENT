"use client";

import React from "react";
import { Play } from "lucide-react";

interface PlayButtonProps {
  onClick: () => void;
}

export function PlayButton({ onClick }: PlayButtonProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <button
        onClick={onClick}
        className="w-20 h-20 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all hover:scale-110"
      >
        <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
      </button>
    </div>
  );
}
