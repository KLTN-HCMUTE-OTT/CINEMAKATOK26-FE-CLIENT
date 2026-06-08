"use client";

import { useRouter } from "next/navigation";
import { DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { RoomCloseReason } from "@/types/watch-party";

const reasonMessages: Record<RoomCloseReason, string> = {
  host_closed: "The host has closed this room.",
  host_left: "The host left — the room has been closed.",
  expired: "This room has expired.",
  idle: "The room closed due to inactivity.",
  admin_closed: "An administrator has closed this room.",
};

interface RoomClosedDialogProps {
  open: boolean;
  reason: RoomCloseReason | null;
  customReason?: string | null;
}

export function RoomClosedDialog({ open, reason, customReason }: RoomClosedDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open}>
      <DialogContent className="bg-gray-900 border border-white/10 text-white max-w-sm p-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-gray-600 to-gray-800" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <DoorOpen className="w-7 h-7 text-gray-400" />
          </div>
          <DialogTitle className="text-lg font-bold text-white mb-2">
            Room closed
          </DialogTitle>
          <div className="mb-6">
            <p className="text-sm text-gray-400">
              {reason ? reasonMessages[reason] : "This watch party has ended."}
            </p>
            {customReason && (
              <p className="text-xs text-gray-500 italic mt-1">Reason: {customReason}</p>
            )}
          </div>
          <Button
            onClick={() => router.push("/watch-party/rooms")}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Browse rooms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
