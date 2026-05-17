"use client";

import { use, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWatchPartyRoom } from "@/hooks/use-watch-party";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/store";
import { RoomLayout } from "@/components/watch-party/room-layout";
import { RoomClosedDialog } from "@/components/watch-party/room-closed-dialog";
import { KickedDialog } from "@/components/watch-party/kicked-dialog";

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openLoginModal();
      router.replace("/watch-party/rooms");
    }
  }, [isAuthenticated, authLoading]);

  const roomState = useWatchPartyRoom(
    isAuthenticated ? roomId : "",
    password
  );

  useEffect(() => {
    if (roomState.error?.code === "WRONG_PASSWORD") {
      toast.error("Wrong room password");
      router.replace("/watch-party/rooms");
    } else if (roomState.error?.code === "NOT_FOUND") {
      toast.error("Room not found");
      router.replace("/watch-party/rooms");
    } else if (roomState.error?.code === "ROOM_FULL") {
      toast.error("Room is full");
      router.replace("/watch-party/rooms");
    } else if (roomState.error?.code === "BANNED") {
      // handled by KickedDialog
    }
  }, [roomState.error]);

  if (authLoading || (!roomState.room && !roomState.isClosed && !roomState.isKicked)) {
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
        <RoomLayout roomId={roomId} roomState={roomState} />
      )}

      <RoomClosedDialog
        open={roomState.isClosed}
        reason={roomState.closeReason}
      />

      <KickedDialog
        open={roomState.isKicked}
        until={roomState.kickedUntil}
      />
    </>
  );
}
