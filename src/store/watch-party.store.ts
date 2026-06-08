"use client";

import { create } from "zustand";
import type {
  RoomSummary,
  RoomMember,
  VideoState,
  ChatMessage,
  Reaction,
  QueueItem,
  RoomCloseReason,
  WatchPartyErrorCode,
} from "@/types/watch-party";

const MAX_MESSAGES = 200;
const MAX_REACTIONS = 30;

export interface BannedMember {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  until: number | null;
}

export interface WatchPartyState {
  room: RoomSummary | null;
  members: RoomMember[];
  videoState: VideoState | null;
  messages: ChatMessage[];
  reactions: Reaction[];
  queue: QueueItem[];
  mutedUsers: Set<string>;
  bannedUsers: Set<string>;
  bannedMemberDetails: Map<string, BannedMember>;
  isClosed: boolean;
  closeReason: RoomCloseReason | null;
  closeCustomReason: string | null;
  isKicked: boolean;
  kickedUntil: number | null;
  kickedBanReason: string | null;
  error: { code: WatchPartyErrorCode; message?: string } | null;
  awaitingHost: boolean;
}

export interface WatchPartyActions {
  setRoomState: (state: {
    room: RoomSummary;
    members: RoomMember[];
    videoState: VideoState;
    recentMessages: ChatMessage[];
    queue: QueueItem[];
    mutedUserIds?: string[];
    bannedUserIds?: string[];
  }) => void;
  addMember: (member: RoomMember) => void;
  removeMember: (userId: string) => void;
  setVideoState: (vs: VideoState) => void;
  addMessage: (msg: ChatMessage) => void;
  addReaction: (r: Reaction) => void;
  removeReaction: (id: string) => void;
  setMemberMuted: (userId: string, muted: boolean) => void;
  setMemberBanned: (userId: string, banned: boolean, details?: Omit<BannedMember, 'userId'>) => void;
  setClosed: (reason: RoomCloseReason, customReason?: string) => void;
  setKicked: (data: { until?: number | null; banReason?: string }) => void;
  setError: (err: { code: WatchPartyErrorCode; message?: string }) => void;
  setQueue: (queue: QueueItem[]) => void;
  setAwaitingHost: (v: boolean) => void;
  reset: () => void;
}

export type WatchPartyStore = WatchPartyState & WatchPartyActions;

const initialState: WatchPartyState = {
  room: null,
  members: [],
  videoState: null,
  messages: [],
  reactions: [],
  queue: [],
  mutedUsers: new Set(),
  bannedUsers: new Set(),
  bannedMemberDetails: new Map(),
  isClosed: false,
  closeReason: null,
  closeCustomReason: null,
  isKicked: false,
  kickedUntil: null,
  kickedBanReason: null,
  error: null,
  awaitingHost: false,
};

export const useWatchPartyStore = create<WatchPartyStore>()((set) => ({
  ...initialState,

  setRoomState: (state) =>
    set({
      room: state.room,
      members: state.members,
      videoState: state.videoState,
      messages: state.recentMessages.slice(-MAX_MESSAGES),
      queue: state.queue,
      awaitingHost: state.videoState?.status === "awaiting_host",
      mutedUsers: new Set(state.mutedUserIds ?? []),
      bannedUsers: new Set(state.bannedUserIds ?? []),
    }),

  addMember: (member) =>
    set((s) => {
      if (s.members.some((m) => m.userId === member.userId)) return s;
      return { members: [...s.members, member] };
    }),

  removeMember: (userId) =>
    set((s) => ({ members: s.members.filter((m) => m.userId !== userId) })),

  setVideoState: (vs) =>
    set({ videoState: vs, awaitingHost: vs.status === "awaiting_host" }),

  addMessage: (msg) =>
    set((s) => {
      const msgs = [...s.messages, msg];
      return { messages: msgs.length > MAX_MESSAGES ? msgs.slice(-MAX_MESSAGES) : msgs };
    }),

  addReaction: (r) =>
    set((s) => {
      const reactions = [...s.reactions, r];
      return {
        reactions:
          reactions.length > MAX_REACTIONS
            ? reactions.slice(-MAX_REACTIONS)
            : reactions,
      };
    }),

  removeReaction: (id) =>
    set((s) => ({ reactions: s.reactions.filter((r) => r.id !== id) })),

  setMemberMuted: (userId, muted) =>
    set((s) => {
      const next = new Set(s.mutedUsers);
      muted ? next.add(userId) : next.delete(userId);
      return { mutedUsers: next };
    }),

  setMemberBanned: (userId, banned, details) =>
    set((s) => {
      const nextSet = new Set(s.bannedUsers);
      const nextMap = new Map(s.bannedMemberDetails);
      if (banned) {
        nextSet.add(userId);
        if (details) nextMap.set(userId, { userId, ...details });
      } else {
        nextSet.delete(userId);
        nextMap.delete(userId);
      }
      return { bannedUsers: nextSet, bannedMemberDetails: nextMap };
    }),

  setClosed: (reason, customReason) => set({ isClosed: true, closeReason: reason, closeCustomReason: customReason ?? null }),

  setKicked: (data) =>
    set({ isKicked: true, kickedUntil: data?.until ?? null, kickedBanReason: data?.banReason ?? null }),

  setError: (err) => set({ error: err }),

  setQueue: (queue) => set({ queue }),

  setAwaitingHost: (v) => set({ awaitingHost: v }),

  reset: () =>
    set({ ...initialState, mutedUsers: new Set(), bannedUsers: new Set(), bannedMemberDetails: new Map() }),
}));
