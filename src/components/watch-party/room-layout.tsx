"use client";

import { useState } from "react";
import { useAuthStore } from "@/store";
import { SyncedVideoPlayer } from "./synced-video-player";
import { LiveChat } from "./live-chat";
import { MemberList } from "./member-list";
import { ReactionsOverlay } from "./reactions-overlay";
import { RoomContentInfo, RoomContentCompact } from "./room-content-info";
import { ContentPickerDialog } from "./content-picker";
import { QueuePanel } from "./queue-panel";
import { useRoomContent } from "@/hooks/use-room-content";
import { saveRoomContentRef } from "@/lib/watch-party-content-cache";
import type { ContentRef } from "@/types/content-ref";
import { Users, MessageSquare, Copy, Check, Crown, Info, X, LogOut, Film, ListVideo } from "lucide-react";
import { toast } from "sonner";

interface RoomLayoutProps {
  roomId: string;
  roomState: any;
  onLeave?: () => void;
  onEndRoom?: () => void;
}

export function RoomLayout({ roomId, roomState, onLeave, onEndRoom }: RoomLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.isAdmin ?? false;
  const [activeTab, setActiveTab] = useState<"chat" | "members" | "queue">("chat");
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { room, members, messages, reactions, videoState, queue = [], mutedUsers, bannedUsers, bannedMemberDetails, awaitingHost, isHost } = roomState;

  const { contentRef } = useRoomContent(roomId, videoState?.videoId ?? "");

  const handleChangeVideo = (ref: ContentRef) => {
    saveRoomContentRef(roomId, ref);
    roomState.playNow({
      videoId: ref.videoId,
      title: ref.title,
      thumbnailUrl: ref.posterUrl,
      durationSec: ref.durationSec,
    });
  };

  const copyInvite = async () => {
    if (!room?.inviteCode) return;
    await navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isMuted = user ? mutedUsers.has(user.id) : false;

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Thin header bar */}
      <div className="flex-none h-12 border-b border-white/8 bg-gray-900/90 backdrop-blur-sm px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {isHost && (
            <span className="flex-none inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-semibold">
              <Crown className="w-2.5 h-2.5" />
              Host
            </span>
          )}
          <h1 className="text-sm font-bold text-white truncate">{room?.title}</h1>
          <span className="flex-none text-xs text-gray-500">
            {members.length}/{room?.maxMembers} members
          </span>

          {/* Compact content info — click to open info panel */}
          {contentRef && (
            <>
              <span className="flex-none text-gray-700">·</span>
              <RoomContentCompact
                contentRef={contentRef}
                onExpand={() => setInfoOpen((v) => !v)}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(isHost || isAdmin) && (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex-none flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors px-2 py-1 rounded-lg hover:bg-purple-500/10"
              title="Change video"
            >
              <Film className="w-3.5 h-3.5" />
              Change video
            </button>
          )}
          {contentRef && (
            <button
              onClick={() => setInfoOpen((v) => !v)}
              className={`flex-none p-1.5 rounded-lg transition-colors ${
                infoOpen
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
              title="Movie info"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={copyInvite}
            className="flex-none flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors px-2 py-1 rounded-lg hover:bg-purple-500/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {room?.inviteCode}
          </button>
          {isAdmin && !isHost && onEndRoom && (
            <button
              onClick={onEndRoom}
              title="Force-close this room (admin)"
              className="flex-none flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              End room
            </button>
          )}
          {onLeave && (
            <button
              onClick={onLeave}
              title={isHost ? "Close room" : "Leave room"}
              className={`flex-none flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                isHost
                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {isHost ? "End" : "Leave"}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video + Reactions */}
        <div className="flex-1 relative flex flex-col min-w-0">
          <div className="flex-1 relative">
            <SyncedVideoPlayer
              videoState={videoState}
              awaitingHost={awaitingHost}
              isHost={isHost}
              isAdmin={isAdmin}
              onSync={roomState.syncVideo}
              onVideoEnd={roomState.notifyVideoEnd}
            />
            <ReactionsOverlay
              reactions={reactions}
              onRemove={roomState.removeReaction}
              onSend={roomState.sendReaction}
              userId={user?.id ?? ""}
            />
          </div>
        </div>

        {/* Right: Chat / Members / Info sidebar */}
        <div className="flex-none w-72 xl:w-80 border-l border-white/8 flex flex-col bg-gray-900/50">
          {/* Info panel (overlay inside sidebar) */}
          {infoOpen && contentRef ? (
            <div className="flex flex-col h-full">
              <div className="flex-none flex items-center justify-between px-3 py-2.5 border-b border-white/8">
                <span className="text-xs font-semibold text-gray-300">
                  Now Watching
                </span>
                <button
                  onClick={() => setInfoOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <RoomContentInfo contentRef={contentRef} />
              </div>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex-none flex border-b border-white/8">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "chat"
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "members"
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Members
                  <span className="text-[10px] bg-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
                    {members.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("queue")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "queue"
                      ? "text-purple-400 border-b-2 border-purple-500"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <ListVideo className="w-3.5 h-3.5" />
                  Queue
                  {queue.length > 0 && (
                    <span className="text-[10px] bg-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
                      {queue.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "chat" && (
                  <LiveChat
                    messages={messages}
                    currentUserId={user?.id ?? ""}
                    isMuted={isMuted}
                    onSend={roomState.sendMessage}
                  />
                )}
                {activeTab === "members" && (
                  <MemberList
                    members={members}
                    hostId={room?.hostId}
                    currentUserId={user?.id ?? ""}
                    isHost={isHost}
                    isCurrentUserAdmin={isAdmin}
                    mutedUsers={mutedUsers}
                    bannedUsers={bannedUsers}
                    bannedMemberDetails={bannedMemberDetails}
                    onMute={roomState.muteMember}
                    onUnmute={roomState.unmuteMember}
                    onKick={roomState.kickMember}
                    onBan={roomState.banMember}
                    onUnban={roomState.unbanMember}
                  />
                )}
                {activeTab === "queue" && (
                  <QueuePanel
                    queue={queue}
                    isHost={isHost}
                    isAdmin={isAdmin}
                    onEnqueue={roomState.enqueueVideo}
                    onRemove={roomState.removeFromQueue}
                    onReorder={roomState.reorderQueue}
                    onPlayNext={roomState.playNext}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ContentPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onConfirm={handleChangeVideo}
      />
    </div>
  );
}
