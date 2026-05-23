"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, X, Plus, ListVideo, SkipForward } from "lucide-react";
import { ContentPickerDialog } from "./content-picker";
import type { QueueItem } from "@/types/watch-party";
import type { ContentRef } from "@/types/content-ref";

interface QueuePanelProps {
  queue: QueueItem[];
  isHost: boolean;
  isAdmin?: boolean;
  onEnqueue: (item: Omit<QueueItem, "addedBy" | "addedAt">) => void;
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onPlayNext: () => void;
}

function formatDuration(sec?: number): string {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function QueuePanel({ queue, isHost, isAdmin = false, onEnqueue, onRemove, onReorder, onPlayNext }: QueuePanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const canControl = isHost || isAdmin;

  const handleConfirm = (ref: ContentRef) => {
    onEnqueue({
      videoId: ref.videoId,
      title: ref.title,
      thumbnailUrl: ref.posterUrl,
      durationSec: ref.durationSec,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-white/8">
        <span className="text-xs font-semibold text-gray-300">
          Up next
          {queue.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
              {queue.length}
            </span>
          )}
        </span>
        {canControl && (
          <div className="flex items-center gap-1">
            {queue.length > 0 && (
              <button
                onClick={onPlayNext}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-purple-400 transition-colors px-1.5 py-1 rounded hover:bg-purple-500/10"
                title="Skip to next"
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </button>
            )}
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors px-1.5 py-1 rounded hover:bg-purple-500/10"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
            <ListVideo className="w-8 h-8 text-gray-700" />
            <p className="text-xs text-gray-600">Queue is empty</p>
            {canControl && (
              <button
                onClick={() => setPickerOpen(true)}
                className="text-xs text-purple-500 hover:text-purple-400 transition-colors mt-1"
              >
                + Add a video
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {queue.map((item, index) => (
              <li key={`${item.videoId}-${item.addedAt}`} className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/3 group">
                {/* Position number */}
                <span className="flex-none w-4 text-center text-[10px] text-gray-600 font-mono">
                  {index + 1}
                </span>

                {/* Thumbnail */}
                <div className="flex-none w-9 h-[52px] rounded bg-gray-800 overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-gray-800" />
                  )}
                </div>

                {/* Title + duration */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 truncate leading-snug">{item.title}</p>
                  {item.durationSec && (
                    <p className="text-[10px] text-gray-600 mt-0.5">{formatDuration(item.durationSec)}</p>
                  )}
                </div>

                {/* Controls */}
                {canControl && (
                  <div className="flex-none flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onReorder(index, index - 1)}
                      disabled={index === 0}
                      className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onReorder(index, index + 1)}
                      disabled={index === queue.length - 1}
                      className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {canControl && (
                  <button
                    onClick={() => onRemove(index)}
                    className="flex-none p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ContentPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
