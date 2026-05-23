"use client";

import { use, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWatchPartyRoom } from "@/hooks/use-watch-party";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore, useAuthStore } from "@/store";
import { watchPartyAdminCloseRoom } from "@/apis/api/watchParty";
import { RoomClosedDialog } from "@/components/watch-party/room-closed-dialog";
import { KickedDialog } from "@/components/watch-party/kicked-dialog";

const RoomLayout = dynamic(
  () =>
    import("@/components/watch-party/room-layout").then((m) => m.RoomLayout),
  { ssr: false },
);

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function WatchPartyRoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const password = searchParams.get("password") ?? undefined;
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openLoginModal();
      router.replace("/watch-party/rooms");
    }
  }, [isAuthenticated, authLoading]);

  const roomState = useWatchPartyRoom(isAuthenticated ? roomId : "", password);

  const handleLeave = () => {
    roomState.leaveRoom();
    router.push("/");
  };

  const handleEndRoom = async () => {
    try {
      await watchPartyAdminCloseRoom({ id: roomId });
      roomState.leaveRoom();
      router.push("/");
    } catch {
      toast.error("Failed to close room");
    }
  };

  useEffect(() => {
    if (!roomState.error) return;
    if (roomState.error.code === "WRONG_PASSWORD") {
      toast.error("Wrong room password");
      router.replace("/watch-party/rooms");
    } else if (roomState.error.code === "NOT_FOUND") {
      toast.error("Room not found");
      router.replace("/watch-party/rooms");
    } else if (roomState.error.code === "ROOM_FULL") {
      toast.error("Room is full");
      router.replace("/watch-party/rooms");
    } else if (roomState.error.code === "BANNED") {
      // handled by KickedDialog
    } else {
      toast.error(roomState.error.message || "Failed to join room");
      router.replace("/watch-party/rooms");
    }
  }, [roomState.error]);

  if (
    authLoading ||
    (!roomState.room && !roomState.isClosed && !roomState.isKicked)
  ) {
    console.log("Loading room state...", { authLoading, roomState });
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-gray-400 text-sm">Joining watch party…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {roomState.room && (
        <RoomLayout
          roomId={roomId}
          roomState={roomState}
          onLeave={handleLeave}
          onEndRoom={isAdmin ? handleEndRoom : undefined}
        />
      )}

      <RoomClosedDialog
        open={roomState.isClosed}
        reason={roomState.closeReason}
        customReason={roomState.closeCustomReason}
      />

      <KickedDialog
        open={roomState.isKicked}
        until={roomState.kickedUntil}
        banReason={roomState.kickedBanReason}
        roomId={roomId}
        onClose={() => router.push("/watch-party/rooms")}
      />
    </>
  );
}
