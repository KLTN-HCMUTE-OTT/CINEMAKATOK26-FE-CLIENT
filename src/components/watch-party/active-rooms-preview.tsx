"use client";

import Link from "next/link";
import { ArrowRight, Tv2 } from "lucide-react";
import { RoomCard } from "./room-card";
import { useRoomList } from "@/hooks/use-watch-party";
import { Skeleton } from "@/components/ui/skeleton";

export function ActiveRoomsPreview() {
  const { rooms, total, isLoading } = useRoomList({ limit: 4, scope: "public" });

  if (!isLoading && total === 0) return null;

  return (
    <section className="px-6 py-8 overflow-hidden relative">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Tv2 className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">
              Live Now
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Watch Parties</h2>
          {total > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
              {total} active
            </span>
          )}
        </div>

        <Link
          href="/watch-party/rooms"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl bg-white/5" />
            ))
          : rooms.slice(0, 4).map((room) => (
              <RoomCard key={room.roomId} room={room} compact />
            ))}
      </div>
    </section>
  );
}
