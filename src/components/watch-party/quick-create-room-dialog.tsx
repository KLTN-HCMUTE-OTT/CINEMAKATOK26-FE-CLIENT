"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Eye,
  EyeOff,
  Globe,
  ShieldOff,
  Loader2,
  Sparkles,
  Film,
  Tv,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateRoom } from "@/hooks/use-watch-party";
import { saveRoomContentRef } from "@/lib/watch-party-content-cache";
import type { ContentRef } from "@/types/content-ref";

interface QuickCreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentRef: ContentRef;
}

export function QuickCreateRoomDialog({
  open,
  onOpenChange,
  contentRef,
}: QuickCreateRoomDialogProps) {
  const router = useRouter();
  const { mutateAsync: createRoom, isPending } = useCreateRoom();

  const [title, setTitle] = useState(contentRef.title);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [titleError, setTitleError] = useState("");

  const handleClose = () => {
    setPassword("");
    setTitleError("");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError("Room title is required");
      return;
    }
    if (title.length > 120) {
      setTitleError("Max 120 characters");
      return;
    }
    if (password && (password.length < 4 || password.length > 64)) {
      toast.error("Password must be 4–64 characters");
      return;
    }

    try {
      const result = await createRoom({
        videoId: contentRef.videoId,
        title: title.trim(),
        password: password || undefined,
        isPublic,
      });

      if (result?.roomId) {
        saveRoomContentRef(result.roomId, contentRef);
        handleClose();
        router.push(`/watch-party/${result.roomId}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Failed to create room. Try again.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-gray-900 border border-white/10 text-white max-w-md p-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white">
              Start a watch party
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/8">
            {contentRef.posterUrl && (
              <div className="relative flex-none w-10 h-14 rounded overflow-hidden bg-gray-800">
                <Image
                  src={contentRef.posterUrl}
                  alt={contentRef.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {contentRef.title}
              </p>
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded mt-1 font-semibold ${
                  contentRef.type === "movie"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-purple-500/15 text-purple-400"
                }`}
              >
                {contentRef.type === "movie" ? (
                  <><Film className="w-2.5 h-2.5" /> Movie</>
                ) : (
                  <><Tv className="w-2.5 h-2.5" /> Episode</>
                )}
              </span>
            </div>
          </div>

          {/* Room title */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">
              Room title
            </label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
              maxLength={120}
              placeholder="e.g. Friday Night Movie Club"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
            />
            {titleError && (
              <p className="text-xs text-red-400 mt-1">{titleError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Password{" "}
              <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank for no password"
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Visibility toggle */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
              isPublic
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
            onClick={() => setIsPublic((v) => !v)}
          >
            <div className="flex items-center gap-2.5">
              {isPublic ? (
                <Globe className="w-4 h-4 text-blue-400" />
              ) : (
                <ShieldOff className="w-4 h-4 text-gray-400" />
              )}
              <div>
                <p className="text-xs font-medium text-white">
                  {isPublic ? "Public room" : "Private room"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {isPublic
                    ? "Discoverable in rooms list"
                    : "Invite-only access"}
                </p>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full relative transition-all ${
                isPublic ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  isPublic ? "left-[18px]" : "left-0.5"
                }`}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Start watch party
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
