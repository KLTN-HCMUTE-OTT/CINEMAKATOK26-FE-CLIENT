"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface KickedDialogProps {
  open: boolean;
  until: number | null;
}

export function KickedDialog({ open, until }: KickedDialogProps) {
  const router = useRouter();
  const isPermanent = !until;
  const isTemporary = until && until > Date.now() / 1000;

  return (
    <Dialog open={open}>
      <DialogContent className="bg-gray-900 border border-red-500/30 text-white max-w-sm p-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-7 h-7 text-red-400" />
          </div>
          <DialogTitle className="text-lg font-bold text-white mb-2">
            You've been removed
          </DialogTitle>
          <p className="text-sm text-gray-400 mb-1">
            {isPermanent
              ? "You have been permanently banned from this room."
              : isTemporary
                ? `You are banned until ${format(new Date((until ?? 0) * 1000), "HH:mm, dd MMM")}.`
                : "You have been removed from this room."}
          </p>
          {isPermanent && (
            <p className="text-xs text-gray-500 mb-6">
              You cannot rejoin this room.
            </p>
          )}
          <Button
            onClick={() => router.push("/watch-party/rooms")}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Back to rooms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
