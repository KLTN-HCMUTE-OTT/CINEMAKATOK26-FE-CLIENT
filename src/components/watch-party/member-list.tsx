"use client";

import { useState } from "react";
import { Crown, MicOff, ShieldBan, MoreVertical, Volume2, ShieldCheck, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RoomMember } from "@/types/watch-party";
import type { BannedMember } from "@/store/watch-party.store";

interface MemberListProps {
  members: RoomMember[];
  hostId?: string;
  currentUserId: string;
  isHost: boolean;
  isCurrentUserAdmin?: boolean;
  mutedUsers: Set<string>;
  bannedUsers: Set<string>;
  bannedMemberDetails: Map<string, BannedMember>;
  onMute: (userId: string, durationSec?: number) => void;
  onUnmute: (userId: string) => void;
  onKick: (userId: string) => void;
  onBan: (userId: string, durationSec?: number) => void;
  onUnban: (userId: string) => void;
}

function getAvatarColor(userId: string) {
  const colors = [
    "from-purple-500 to-blue-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-cyan-600",
    "from-violet-500 to-purple-600",
  ];
  let hash = 0;
  for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export function MemberList({
  members,
  hostId,
  currentUserId,
  isHost,
  isCurrentUserAdmin = false,
  mutedUsers,
  bannedUsers,
  bannedMemberDetails,
  onMute,
  onUnmute,
  onKick,
  onBan,
  onUnban,
}: MemberListProps) {
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set());
  const bannedList = Array.from(bannedMemberDetails.values());

  return (
    <div className="h-full overflow-y-auto py-2">
      {members.map((member) => {
        const isThisHost = member.userId === hostId;
        const isThisAdmin = member.role === 'admin';
        const isMe = member.userId === currentUserId;
        const isMuted = mutedUsers.has(member.userId);
        const isBanned = bannedUsers.has(member.userId);

        return (
          <div
            key={member.userId}
            className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/4 transition-colors group"
          >
            {/* Avatar */}
            <div className="relative flex-none">
              {member.avatarUrl && !failedAvatars.has(member.userId) ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() =>
                    setFailedAvatars((prev) => {
                      const next = new Set(prev);
                      next.add(member.userId);
                      return next;
                    })
                  }
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(member.userId)} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {member.displayName[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              {isThisHost && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {!isThisHost && isThisAdmin && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <ShieldAlert className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm font-medium truncate ${
                    isMe ? "text-purple-300" : "text-white"
                  }`}
                >
                  {member.displayName}
                  {isMe && (
                    <span className="text-[10px] text-purple-400 ml-1">(you)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {isThisHost && (
                  <span className="text-[10px] text-amber-400 font-medium">Host</span>
                )}
                {!isThisHost && isThisAdmin && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-400 font-medium">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
                {isMuted && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500">
                    <MicOff className="w-2.5 h-2.5" />
                    Muted
                  </span>
                )}
                {isBanned && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400">
                    <ShieldBan className="w-2.5 h-2.5" />
                    Banned
                  </span>
                )}
              </div>
            </div>

            {/* Moderation actions: host can moderate non-admins; platform admin can moderate anyone */}
            {(isHost || isCurrentUserAdmin) && !isMe && (!isThisAdmin || isCurrentUserAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900 border border-white/10 text-white w-44"
                >
                  <DropdownMenuLabel className="text-gray-400 text-xs">
                    {member.displayName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />

                  {isMuted ? (
                    <DropdownMenuItem
                      onClick={() => onUnmute(member.userId)}
                      className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10"
                    >
                      <Volume2 className="w-3.5 h-3.5 mr-2 text-green-400" />
                      Unmute
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => onMute(member.userId, 300)}
                        className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10"
                      >
                        <MicOff className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                        Mute 5 min
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onMute(member.userId, 3600)}
                        className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10"
                      >
                        <MicOff className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                        Mute 1 hour
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onMute(member.userId)}
                        className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10"
                      >
                        <MicOff className="w-3.5 h-3.5 mr-2 text-orange-400" />
                        Mute permanently
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    onClick={() => onKick(member.userId)}
                    className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10 text-orange-400"
                  >
                    <ShieldBan className="w-3.5 h-3.5 mr-2" />
                    Kick
                  </DropdownMenuItem>

                  {isBanned ? (
                    <DropdownMenuItem
                      onClick={() => onUnban(member.userId)}
                      className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10 text-green-400"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                      Unban
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => onBan(member.userId, 3600)}
                        className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10 text-red-400"
                      >
                        <ShieldBan className="w-3.5 h-3.5 mr-2" />
                        Ban 1 hour
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onBan(member.userId)}
                        className="text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10 text-red-400"
                      >
                        <ShieldBan className="w-3.5 h-3.5 mr-2" />
                        Ban permanently
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}

      {members.length === 0 && bannedList.length === 0 && (
        <div className="flex items-center justify-center h-24 text-gray-600 text-sm">
          No members yet
        </div>
      )}

      {/* Banned users section (host/admin) */}
      {(isHost || isCurrentUserAdmin) && bannedList.length > 0 && (
        <div className="mt-1 border-t border-white/8 pt-1">
          <div className="px-3 py-1.5 flex items-center gap-1.5">
            <ShieldBan className="w-3 h-3 text-red-500/60" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Banned ({bannedList.length})
            </span>
          </div>
          {bannedList.map((banned) => (
            <div
              key={banned.userId}
              className="flex items-center gap-2.5 px-3 py-2 group opacity-60 hover:opacity-100 transition-opacity"
            >
              {/* Avatar */}
              <div className="flex-none">
                {banned.avatarUrl && !failedAvatars.has(banned.userId) ? (
                  <img
                    src={banned.avatarUrl}
                    alt={banned.displayName}
                    className="w-8 h-8 rounded-full object-cover grayscale"
                    onError={() =>
                      setFailedAvatars((prev) => {
                        const next = new Set(prev);
                        next.add(banned.userId);
                        return next;
                      })
                    }
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(banned.userId)} flex items-center justify-center text-white text-xs font-bold grayscale`}
                  >
                    {banned.displayName[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>

              {/* Name + ban duration */}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-400 truncate block">
                  {banned.displayName}
                </span>
                <span className="text-[10px] text-red-500/70">
                  {banned.until === null
                    ? "Permanent ban"
                    : `Until ${format(new Date(banned.until), "HH:mm, dd MMM")}`}
                </span>
              </div>

              {/* Unban button */}
              <button
                onClick={() => onUnban(banned.userId)}
                title="Unban"
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded hover:bg-green-500/10 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
