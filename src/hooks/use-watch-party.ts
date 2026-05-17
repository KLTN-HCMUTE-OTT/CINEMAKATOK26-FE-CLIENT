"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { queryKeys } from "@/lib/query-keys";
import {
  watchPartyControllerListRooms,
  watchPartyControllerCreateRoom,
  watchPartyControllerLookupInvite,
  watchPartyControllerCloseRoom,
  watchPartyControllerMyRoom,
} from "@/apis/api/watchParty";
import type { CreateRoomInput, RoomListItem } from "@/types/watch-party";
import { useAuthStore } from "@/store";
import { getWatchPartySocket } from "@/lib/watch-party-socket";
import { useWatchPartyStore } from "@/store/watch-party.store";

// ── Phase 1: REST hooks ──────────────────────────────────────────────────────

export function useRoomList(params?: {
  scope?: "public" | "all";
  videoId?: string;
  limit?: number;
  offset?: number;
}) {
  const scope = params?.scope ?? "public";
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  const videoId = params?.videoId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.watchParty.rooms({ scope, limit, offset, videoId }),
    queryFn: async () => {
      const res = await watchPartyControllerListRooms({
        scope,
        limit,
        offset,
        videoId,
      });
      return res.data?.data as { items: RoomListItem[]; total: number };
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  return {
    rooms: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoomInput) =>
      watchPartyControllerCreateRoom(input).then((r) => r.data?.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchParty.all });
    },
  });
}

export function useInviteLookup(code: string | null) {
  return useQuery({
    queryKey: queryKeys.watchParty.invite(code ?? ""),
    queryFn: async () => {
      const res = await watchPartyControllerLookupInvite({ code: code! });
      return res.data?.data;
    },
    enabled: Boolean(code),
    retry: false,
  });
}

export function useMyRoom() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.watchParty.myRoom(),
    queryFn: async () => {
      const res = await watchPartyControllerMyRoom();
      return res.data?.data ?? null;
    },
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

export function useCloseRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) =>
      watchPartyControllerCloseRoom({ id: roomId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchParty.all });
    },
  });
}

// ── Phase 3: WebSocket room hook ─────────────────────────────────────────────

export function useWatchPartyRoom(roomId: string, password?: string) {
  const user = useAuthStore((s) => s.user);
  const store = useWatchPartyStore();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const token =
      typeof window !== "undefined"
        ? (sessionStorage.getItem("cinemakatok-auth") &&
            (() => {
              try {
                return JSON.parse(
                  sessionStorage.getItem("cinemakatok-auth") ?? "{}"
                )?.state?.accessToken;
              } catch {
                return null;
              }
            })()) ||
          null
        : null;

    const socket = getWatchPartySocket(user.id);

    if (!joinedRef.current) {
      joinedRef.current = true;
      socket.emit("room:join", { roomId, password });
    }

    socket.on("room:state", (state: any) => store.setRoomState(state));
    socket.on("room:member-joined", (member: any) => store.addMember(member));
    socket.on("room:member-left", (data: any) =>
      store.removeMember(data.userId)
    );
    socket.on("video:sync-update", (vs: any) => store.setVideoState(vs));
    socket.on("chat:new-message", (msg: any) => store.addMessage(msg));
    socket.on("reaction:broadcast", (r: any) => store.addReaction(r));
    socket.on("room:member-muted", (data: any) =>
      store.setMemberMuted(data.userId, true)
    );
    socket.on("room:member-unmuted", (data: any) =>
      store.setMemberMuted(data.userId, false)
    );
    socket.on("room:member-banned", (data: any) =>
      store.setMemberBanned(data.userId, true)
    );
    socket.on("room:member-unbanned", (data: any) =>
      store.setMemberBanned(data.userId, false)
    );
    socket.on("queue:updated", (queue: any) => store.setQueue(queue));
    socket.on("video:changed", (data: any) => {
      store.setVideoState(data.videoState);
      store.setQueue(data.queue ?? []);
      store.setAwaitingHost(false);
    });
    socket.on("video:queue-empty", () => store.setAwaitingHost(true));
    socket.on("room:closed", (data: any) =>
      store.setClosed(data?.reason ?? "host_closed")
    );
    socket.on("room:kicked", (data: any) => store.setKicked(data));
    socket.on("error", (err: any) => store.setError(err));

    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("room:state");
      socket.off("room:member-joined");
      socket.off("room:member-left");
      socket.off("video:sync-update");
      socket.off("chat:new-message");
      socket.off("reaction:broadcast");
      socket.off("room:member-muted");
      socket.off("room:member-unmuted");
      socket.off("room:member-banned");
      socket.off("room:member-unbanned");
      socket.off("queue:updated");
      socket.off("video:changed");
      socket.off("video:queue-empty");
      socket.off("room:closed");
      socket.off("room:kicked");
      socket.off("error");
      joinedRef.current = false;
      store.reset();
    };
  }, [roomId, user?.id]);

  const socket = user ? getWatchPartySocket(user.id) : null;

  return {
    ...store,
    isHost: store.room?.hostId === user?.id,
    syncVideo: (state: { isPlaying: boolean; currentTime: number }) =>
      socket?.emit("video:sync", { roomId, state }),
    sendMessage: (text: string) =>
      socket?.emit("chat:message", { roomId, text }),
    sendReaction: (emoji: string) =>
      socket?.emit("reaction:send", { roomId, emoji }),
    muteMember: (userId: string, durationSec?: number) =>
      socket?.emit("member:mute", { roomId, userId, durationSec }),
    unmuteMember: (userId: string) =>
      socket?.emit("member:unmute", { roomId, userId }),
    banMember: (userId: string, durationSec?: number) =>
      socket?.emit("member:ban", { roomId, userId, durationSec }),
    unbanMember: (userId: string) =>
      socket?.emit("member:unban", { roomId, userId }),
    enqueueVideo: (item: any) =>
      socket?.emit("queue:add", { roomId, ...item }),
    removeFromQueue: (index: number) =>
      socket?.emit("queue:remove", { roomId, index }),
    reorderQueue: (from: number, to: number) =>
      socket?.emit("queue:reorder", { roomId, from, to }),
    playNow: (item: any) => socket?.emit("video:play-now", { roomId, ...item }),
    playNext: () => socket?.emit("video:play-next", { roomId }),
    notifyVideoEnd: (videoId: string) =>
      socket?.emit("video:end", { roomId, videoId }),
  };
}
