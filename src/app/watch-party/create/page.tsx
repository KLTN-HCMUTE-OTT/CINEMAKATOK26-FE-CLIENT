"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Popcorn } from "lucide-react";
import { Header } from "@/components/header";
import { CreateRoomForm } from "@/components/watch-party/create-room-form";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/store";

export default function CreateWatchPartyPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLoginModal();
      router.replace("/watch-party/rooms");
    }
  }, [isAuthenticated, isLoading]);

  if (!isAuthenticated && !isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      <Header variant="relative" />

      <div className="container mx-auto px-4 py-10 max-w-xl">
        {/* Back nav */}
        <Link
          href="/watch-party/rooms"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to rooms
        </Link>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-slate-900/80 to-gray-950 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Popcorn className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">
                  Create watch party
                </h1>
                <p className="text-sm text-gray-400">
                  Set up a room and invite your friends
                </p>
              </div>
            </div>

            <CreateRoomForm />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/3">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="text-gray-400 font-medium">Tips: </span>
            After creating the room, share the invite code with friends. Public
            rooms appear in the rooms list for anyone to discover.
          </p>
        </div>
      </div>
    </div>
  );
}
