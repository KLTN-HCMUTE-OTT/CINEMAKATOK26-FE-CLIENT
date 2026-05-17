"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Lock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { watchPartyControllerLookupInvite } from "@/apis/api/watchParty";

interface JoinByCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinByCodeModal({ open, onClose }: JoinByCodeModalProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"code" | "password">("code");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setCode("");
    setPassword("");
    setStep("code");
    setRoomId("");
    setError(null);
    onClose();
  };

  const handleLookup = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await watchPartyControllerLookupInvite({
        code: code.trim().toLowerCase(),
      });
      const data = res.data?.data;
      if (!data) throw new Error("Room not found");
      setRoomId(data.roomId);
      if (data.requirePassword) {
        setStep("password");
      } else {
        router.push(`/watch-party/${data.roomId}`);
        handleClose();
      }
    } catch {
      setError("Invite code not found or expired");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWithPassword = () => {
    if (!roomId) return;
    const url = password
      ? `/watch-party/${roomId}?password=${encodeURIComponent(password)}`
      : `/watch-party/${roomId}`;
    router.push(url);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-gray-900 border border-white/10 text-white max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Header gradient strip */}
          <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <DialogTitle className="text-lg font-bold text-white">
                {step === "code" ? "Join by invite code" : "Enter password"}
              </DialogTitle>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === "code" ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Enter the invite code shared by the room host.
                </p>
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="e.g. abc123"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-base tracking-widest font-mono focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <Button
                  onClick={handleLookup}
                  disabled={!code.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isLoading ? "Looking up…" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  This room requires a password to join.
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleJoinWithPassword()
                  }
                  type="password"
                  placeholder="Room password"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-base focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
                />
                <p className="text-xs text-gray-500">
                  Wrong password? You'll see an error inside the room.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep("code")}
                    variant="outline"
                    className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinWithPassword}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Join room
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
