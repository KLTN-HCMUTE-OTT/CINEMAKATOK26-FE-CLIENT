"use client";

import React, { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  buffered: number;
  currentTime: number;
  duration: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
  showTooltip?: boolean;
  tooltipTime?: number;
  tooltipPosition?: number;
  formatTime?: (seconds: number) => string;
  dragTime?: number | null;
  sprites?: string[];
  vttFiles?: string[];
}

type Cue = {
  start: number;
  end: number;
  spriteUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function parseTime(timeStr: string): number {
  const parts = timeStr.split(":").map(parseFloat);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

function parseVTT(vttText: string, spriteUrl: string): Cue[] {
  const lines = vttText.split("\n");
  const cues: Cue[] = [];
  let i = 0;
  // Skip header
  while (i < lines.length && lines[i].trim() !== "") i++;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes("-->")) {
      const [startStr, endStr] = line.split(" --> ");
      const start = parseTime(startStr);
      const end = parseTime(endStr);
      i++;
      if (i < lines.length) {
        const spriteLine = lines[i].trim();
        const [spritePart, xywhPart] = spriteLine.split("#xywh=");
        if (xywhPart) {
          const [x, y, w, h] = xywhPart.split(",").map(Number);
          cues.push({ start, end, spriteUrl, x, y, w, h });
        }
      }
    }
    i++;
  }
  return cues;
}

export function ProgressBar({
  progressBarRef,
  buffered,
  currentTime,
  duration,
  onSeek,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  showTooltip = false,
  tooltipTime = 0,
  tooltipPosition = 0,
  formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`,
  dragTime = null,
  sprites,
  vttFiles,
}: ProgressBarProps) {
  const [localDragTime, setLocalDragTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cues, setCues] = useState<Cue[]>([]);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Listen for mouseup on document to handle drag end anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setLocalDragTime(null);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const time = Math.max(0, Math.min(pos * duration, duration));
        setLocalDragTime(time);
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }
  }, [isDragging, duration]);

  // Load and parse VTT for preview images
  useEffect(() => {
    if (vttFiles && vttFiles.length > 0 && sprites && sprites.length > 0) {
      const loadAllVTTs = async () => {
        try {
          const allCues: Cue[] = [];
          // Load each VTT file with its corresponding sprite
          const maxFiles = Math.min(vttFiles.length, sprites.length);
          for (let i = 0; i < maxFiles; i++) {
            const response = await fetch(vttFiles[i]);
            const text = await response.text();
            const parsedCues = parseVTT(text, sprites[i]);
            allCues.push(...parsedCues);
          }
          // Sort cues by start time
          allCues.sort((a, b) => a.start - b.start);
          setCues(allCues);
        } catch (err) {
          console.error("Failed to load VTT files", err);
          setCues([]);
        }
      };
      loadAllVTTs();
    } else {
      setCues([]);
    }
  }, [vttFiles, sprites]);

  // Use localDragTime for smooth visual feedback
  const displayTime = localDragTime !== null ? localDragTime : currentTime;

  // Find the current cue for the tooltip time
  const currentCue = cues.find(
    (cue) => cue.start <= tooltipTime && tooltipTime < cue.end
  );

  // Adjust tooltip position to prevent going off screen
  useEffect(() => {
    if (tooltipRef.current && progressBarRef.current) {
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const progressBarWidth = progressBarRef.current.offsetWidth;
      const minLeft = tooltipWidth / 2;
      const maxLeft = progressBarWidth - tooltipWidth / 2;
      const desiredLeft = (tooltipPosition / 100) * progressBarWidth;
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, desiredLeft));
      setTooltipLeft((clampedLeft / progressBarWidth) * 100);
    } else {
      setTooltipLeft(tooltipPosition);
    }
  }, [tooltipPosition, showTooltip, currentCue]);

  const handleLocalMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onMouseDown?.(e);
  };

  const handleLocalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const time = pos * duration;
      setLocalDragTime(Math.max(0, Math.min(time, duration)));
    }
    onMouseMove?.(e);
  };

  const handleLocalMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't reset here, global mouseup handler will handle it
  };

  const handleLocalMouseLeave = () => {
    // Don't reset drag state on mouseleave, only on mouseup
    // setIsDragging(false);
    // setLocalDragTime(null);
    onMouseLeave?.();
  };

  return (
    <div
      ref={progressBarRef}
      className={`relative w-full h-1.5 md:h-2 bg-white/30 rounded-full cursor-pointer mb-4 group/progress hover:h-2.5 transition-all ${
        isDragging ? "h-2.5" : ""
      }`}
      onClick={onSeek}
      onMouseDown={handleLocalMouseDown}
      onMouseMove={handleLocalMouseMove}
      onMouseUp={handleLocalMouseUp}
      onMouseLeave={handleLocalMouseLeave}
    >
      {/* Buffered */}
      <div
        className="absolute h-full bg-white/40 rounded-full"
        style={{ width: `${buffered}%` }}
      />
      {/* Progress */}
      <div
        className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
        style={{ width: `${(displayTime / duration) * 100}%` }}
      >
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity ${
            isDragging ? "opacity-100" : ""
          }`}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full mb-2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-50 flex flex-col items-center"
          style={{ left: `${tooltipLeft}%` }}
        >
          {currentCue && (
            <div
              className="mb-1 rounded overflow-hidden"
              style={{
                backgroundImage: `url(${currentCue.spriteUrl})`,
                backgroundPosition: `-${currentCue.x}px -${currentCue.y}px`,
                width: `${currentCue.w}px`,
                height: `${currentCue.h}px`,
                backgroundSize: "auto", // Assuming the sprite is the full size
              }}
            />
          )}
          {formatTime(tooltipTime)}
        </div>
      )}
    </div>
  );
}
