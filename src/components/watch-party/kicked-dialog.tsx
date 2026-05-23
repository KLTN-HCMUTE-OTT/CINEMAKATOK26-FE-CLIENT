"use client";

import { useRouter } from "next/navigation";
import { ShieldX, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface KickedDialogProps {
  open: boolean;
  until: number | null;
  banReason?: string | null;
  roomId?: string;
  onClose?: () => void;
}

export function KickedDialog({ open, until, banReason, roomId, onClose }: KickedDialogProps) {
  const router = useRouter();

  const handleClose = () => {
    onClose?.();
    router.push("/watch-party/rooms");
  };

  // until === 0  → kick only (can rejoin)
  // until === null → permanent ban
  // until > Date.now() → temporary ban (until is ms timestamp)
  const isKickOnly = until === 0;
  const isPermanent = until === null;
  const isTemporary = until !== null && until !== 0 && until > Date.now();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="bg-gray-900 border border-red-500/30 text-white max-w-sm p-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-7 h-7 text-red-400" />
          </div>
          <DialogTitle className="text-lg font-bold text-white mb-2">
            {isKickOnly ? "You've been kicked" : "You've been removed"}
          </DialogTitle>
          <p className="text-sm text-gray-400 mb-1">
            {isKickOnly
              ? "The host has removed you from this room."
              : isPermanent
                ? "You have been permanently banned from this room."
                : isTemporary
                  ? `You are banned until ${format(new Date(until), "HH:mm, dd MMM")}.`
                  : "You have been removed from this room."}
          </p>
          {banReason && (
            <p className="text-xs text-gray-500 mt-1 mb-1 italic">
              Reason: {banReason}
            </p>
          )}
          {isPermanent && (
            <p className="text-xs text-gray-500 mb-2">
              You cannot rejoin this room.
            </p>
          )}

          {isKickOnly ? (
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10"
              >
                Back to rooms
              </Button>
              <Button
                onClick={() => roomId && router.push(`/watch-party/${roomId}`)}
                disabled={!roomId}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Rejoin
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleClose}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Back to rooms
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
