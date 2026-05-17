"use client";

import Link from "next/link";
import { Lock, Users, Clock, Radio } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RoomListItem } from "@/types/watch-party";

interface RoomCardProps {
  room: RoomListItem;
  compact?: boolean;
}

function getInitials(title: string) {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function RoomCard({ room, compact = false }: RoomCardProps) {
  const occupancy = room.memberCount / room.maxMembers;
  const isNearlyFull = occupancy >= 0.8;
  const isFull = room.memberCount >= room.maxMembers;

  return (
    <Link href={`/watch-party/${room.roomId}`} className="block group">
      <div
        className={`
          relative overflow-hidden rounded-xl border border-white/10
          bg-gradient-to-br from-gray-900 via-slate-900/90 to-gray-950
          transition-all duration-300 ease-out
          hover:border-purple-500/50 hover:shadow-[0_0_24px_rgba(139,92,246,0.2)]
          hover:-translate-y-0.5
          ${compact ? "p-3" : "p-4"}
        `}
      >
        {/* Live pulse indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-purple-400 uppercase">
            Live
          </span>
        </div>

        {/* Thumbnail / Gradient placeholder */}
        <div
          className={`
            relative rounded-lg overflow-hidden mb-3
            bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-slate-900/40
            flex items-center justify-center
            border border-white/5
            ${compact ? "h-24" : "h-36"}
          `}
        >
          <div className="text-2xl font-black text-white/20 tracking-wider select-none">
            {getInitials(room.title)}
          </div>

          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        </div>

        {/* Room title */}
        <h3
          className={`
            font-bold text-white leading-snug line-clamp-2 mb-2 pr-8
            ${compact ? "text-sm" : "text-base"}
          `}
        >
          {room.title}
        </h3>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {room.requirePassword && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">
              <Lock className="w-2.5 h-2.5" />
              Password
            </span>
          )}

          {!room.isPublic && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/20 font-medium">
              Private
            </span>
          )}

          {isFull ? (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
              Full
            </span>
          ) : isNearlyFull ? (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 font-medium">
              Almost full
            </span>
          ) : null}
        </div>

        {/* Footer: members + time */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>
              <span className={isNearlyFull ? "text-orange-400 font-semibold" : "text-white"}>
                {room.memberCount}
              </span>
              <span className="text-gray-600">/{room.maxMembers}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(room.createdAt * 1000), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
