"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

export function ProfileHeader() {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);

  // Get user info from localStorage
  const userName = user?.name || "Guest User";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatar;

  useEffect(() => {
    setImageError(false);
    setAvatarKey((prev) => prev + 1);
  }, [userAvatar]);

  return (
    <div className="flex items-center justify-between mb-12">
      {/* Left: Avatar và tên */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10">
          {userAvatar && !imageError ? (
            <Image
              key={avatarKey}
              src={userAvatar}
              alt={userName}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {userName ? (
                <span className="text-2xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{userName}</h1>
          {userEmail && <p className="text-gray-400 text-sm">{userEmail}</p>}
          <p className="text-gray-500 text-xs mt-1">Free Plan</p>
        </div>
      </div>

      {/* Right: Upgrade button */}
      <Button className="bg-gradient-to-r from-[#7C5CFF] to-[#A78BFA] hover:from-[#6B4EE6] hover:to-[#9673E6] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
        <span>Upgrade Premium</span>
        <Crown className="w-4 h-4" />
      </Button>
    </div>
  );
}
