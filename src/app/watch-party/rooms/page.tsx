"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, RefreshCw, Tv2, Lock, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RoomCard } from "@/components/watch-party/room-card";
import { JoinByCodeModal } from "@/components/watch-party/join-by-code-modal";
import { useRoomList } from "@/hooks/use-watch-party";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { RoomListItem } from "@/types/watch-party";

export default function WatchPartyRoomsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPassword, setFilterPassword] = useState<
    "all" | "free" | "password"
  >("all");
  const [passwordRoom, setPasswordRoom] = useState<RoomListItem | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const { rooms, total, isLoading, error, refetch } = useRoomList({
    scope: "public",
    limit: 50,
  });

  const filtered = rooms.filter((r) => {
    const matchSearch =
      !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterPassword === "all"
        ? true
        : filterPassword === "free"
          ? !r.requirePassword
          : r.requirePassword;
    return matchSearch && matchFilter;
  });

  const handleCreate = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    router.push("/watch-party/create");
  };

  const handleJoinByCode = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setShowJoinModal(true);
  };

  const handleRoomClick = (room: RoomListItem) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (room.requirePassword) {
      setPasswordRoom(room);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      router.push(`/watch-party/${room.roomId}`);
    }
  };

  const handlePasswordJoin = () => {
    if (!passwordRoom) return;
    if (!passwordInput.trim()) {
      setPasswordError(true);
      return;
    }
    router.push(`/watch-party/${passwordRoom.roomId}?password=${encodeURIComponent(passwordInput)}`);
    setPasswordRoom(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      <Header variant="relative" />

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tv2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">
                Watch Together
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">
              Live Watch Parties
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isLoading ? "Loading rooms…" : `${total} active room${total !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleJoinByCode}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              Enter invite code
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create room
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms…"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            {(["all", "free", "password"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterPassword(f)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                  ${
                    filterPassword === f
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                {f === "all" ? "All" : f === "free" ? "No password" : "Password"}
              </button>
            ))}

            <button
              onClick={() => refetch()}
              className="ml-1 p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-52 rounded-xl bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-400 mb-4">Failed to load rooms</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-white/20 text-white bg-transparent hover:bg-white/10"
            >
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {search || filterPassword !== "all"
                ? "No rooms match your filter"
                : "No active rooms"}
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              {search || filterPassword !== "all"
                ? "Try adjusting your filters"
                : "Be the first to start a watch party!"}
            </p>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create a room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((room) => (
              <RoomCard key={room.roomId} room={room} onJoin={handleRoomClick} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      <JoinByCodeModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />

      {/* Password dialog for protected rooms */}
      <Dialog open={!!passwordRoom} onOpenChange={(v) => !v && setPasswordRoom(null)}>
        <DialogContent showCloseButton={false} className="bg-gray-900 border border-white/10 text-white max-w-sm p-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold text-white">Enter room password</DialogTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{passwordRoom?.title}</span>
            </div>
            <input
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordJoin()}
              type="password"
              placeholder="Room password"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
            />
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Please enter a password
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => setPasswordRoom(null)}
                variant="outline"
                className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordJoin}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Join room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
