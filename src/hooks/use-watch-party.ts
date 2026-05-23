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
import type { BannedMember } from "@/store/watch-party.store";

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
  const socketRef = useRef<ReturnType<typeof getWatchPartySocket> | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = getWatchPartySocket(user.id);
    socketRef.current = socket;

    socket.on("connect_error", (err: Error) => {
      let isAuthError = false;
      try {
        const parsed = JSON.parse(err.message) as { code?: string };
        isAuthError = parsed?.code === "UNAUTHORIZED";
      } catch {
        isAuthError =
          (err as any)?.data?.code === "UNAUTHORIZED" ||
          err.message === "UNAUTHORIZED";
      }
      store.setError({
        code: isAuthError ? "NOT_AUTHORIZED" : "INTERNAL_ERROR",
        message: err.message,
      });
    });

    const emitJoin = () => socket.emit("room:join", { roomId, password });

    // Re-join after reconnect so the server restores socket data (roomId, etc.)
    const handleReconnect = () => {
      if (joinedRef.current) emitJoin();
    };
    socket.on("connect", handleReconnect);

    // Register ALL listeners before emitting room:join so fast server responses
    // (e.g. BANNED error returning room:kicked) are never missed.
    socket.on("room:state", (state: any) => store.setRoomState(state));
    socket.on("room:member-joined", (data: any) => store.addMember(data.member));
    socket.on("room:member-left", (data: any) =>
      store.removeMember(data.userId)
    );
    socket.on("video:sync-update", (vs: any) => store.setVideoState(vs));
    socket.on("chat:new-message", (data: any) => store.addMessage(data.message));
    socket.on("reaction:broadcast", (r: any) => store.addReaction(r));
    socket.on("room:member-muted", (data: any) =>
      store.setMemberMuted(data.userId, true)
    );
    socket.on("room:member-unmuted", (data: any) =>
      store.setMemberMuted(data.userId, false)
    );
    socket.on("room:member-banned", (data: any) => {
      // Capture display name while member is still in the members list
      const { members } = useWatchPartyStore.getState();
      const member = members.find((m) => m.userId === data.userId);
      const details: Omit<BannedMember, "userId"> = {
        displayName: member?.displayName ?? `User ${(data.userId as string).slice(0, 6)}`,
        avatarUrl: member?.avatarUrl,
        until: data.until ?? null,
      };
      store.setMemberBanned(data.userId, true, details);
    });
    socket.on("room:member-unbanned", (data: any) =>
      store.setMemberBanned(data.userId, false)
    );
    socket.on("queue:updated", (data: any) => store.setQueue(data.queue ?? []));
    socket.on("video:changed", (data: any) => {
      store.setVideoState(data.videoState);
      store.setQueue(data.queue ?? []);
      store.setAwaitingHost(false);
    });
    socket.on("video:queue-empty", () => store.setAwaitingHost(true));
    socket.on("room:closed", (data: any) =>
      store.setClosed(data?.reason ?? "host_closed", data?.customReason)
    );
    socket.on("room:kicked", (data: any) => store.setKicked(data));
    socket.on("error", (err: any) => store.setError(err));

    if (!joinedRef.current) {
      joinedRef.current = true;
      if (socket.connected) {
        emitJoin();
      } else {
        socket.once("connect", emitJoin);
      }
    }

    return () => {
      if (joinedRef.current) {
        socket.emit("room:leave", { roomId });
      }
      socket.off("connect_error");
      socket.off("connect", handleReconnect);
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
      socketRef.current = null;
      joinedRef.current = false;
      store.reset();
    };
  }, [roomId, user?.id]);

  return {
    ...store,
    isHost: store.room?.hostId === user?.id,
    isAdmin: user?.isAdmin ?? false,
    leaveRoom: () => {
      joinedRef.current = false;
      socketRef.current?.emit("room:leave", { roomId });
    },
    syncVideo: (state: { isPlaying: boolean; currentTime: number }) =>
      socketRef.current?.emit("video:sync", { roomId, ...state }),
    sendMessage: (text: string) =>
      socketRef.current?.emit("chat:message", { roomId, text }),
    sendReaction: (emoji: string) =>
      socketRef.current?.emit("reaction:send", { roomId, emoji }),
    muteMember: (userId: string, durationSec?: number) =>
      socketRef.current?.emit("member:mute", { roomId, userId, durationSec }),
    unmuteMember: (userId: string) =>
      socketRef.current?.emit("member:unmute", { roomId, userId }),
    kickMember: (userId: string) =>
      socketRef.current?.emit("member:kick", { roomId, userId }),
    banMember: (userId: string, durationSec?: number) =>
      socketRef.current?.emit("member:ban", { roomId, userId, durationSec }),
    unbanMember: (userId: string) =>
      socketRef.current?.emit("member:unban", { roomId, userId }),
    enqueueVideo: (item: any) =>
      socketRef.current?.emit("queue:add", { roomId, ...item }),
    removeFromQueue: (index: number) =>
      socketRef.current?.emit("queue:remove", { roomId, index }),
    reorderQueue: (from: number, to: number) =>
      socketRef.current?.emit("queue:reorder", { roomId, from, to }),
    playNow: (item: any) =>
      socketRef.current?.emit("video:play-now", { roomId, ...item }),
    playNext: () => socketRef.current?.emit("video:play-next", { roomId }),
    notifyVideoEnd: (videoId: string) =>
      socketRef.current?.emit("video:end", { roomId, videoId }),
  };
}
