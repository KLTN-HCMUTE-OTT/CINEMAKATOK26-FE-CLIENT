"use client";

import React from "react";

export function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
