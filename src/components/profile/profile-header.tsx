"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscriptionControllerGetMySubscription } from "@/apis/api/subscriptions";
import { paymentControllerInitiateSubscription } from "@/apis/api/payments";
import { toast } from "sonner";

export function ProfileHeader() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ["subscriptions", "me", user?.id],
    queryFn: async () => {
      const response = await subscriptionControllerGetMySubscription();
      return response.data.data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Get user info
  const userName = user?.name || "Guest User";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatar;

  useEffect(() => {
    setImageError(false);
    setAvatarKey((prev) => prev + 1);
  }, [userAvatar]);

  const hasActiveSub = subscription && subscription.status === "active";
  const planName = subscription?.planName
    ? `${subscription.planName.charAt(0).toUpperCase()}${subscription.planName.slice(1)} Plan`
    : "";
  const handleUpgrade = async () => {
    try {
      setIsSubmitting(true);
      const res = await paymentControllerInitiateSubscription({ plan: "premium" });
      const paymentUrl = res.data?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      toast.error("Failed to initiate upgrade payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isAuthLoading || (user?.id && isSubLoading) ? (
            <div className="h-4 w-24 bg-white/10 animate-pulse rounded mt-1" />
          ) : hasActiveSub ? (
            <p className="text-yellow-400 font-semibold text-xs mt-1 flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {planName}
            </p>
          ) : (
            <p className="text-gray-500 text-xs mt-1">{planName || "Free Plan"}</p>
          )}
        </div>
      </div>

      {/* Right: Upgrade button / Status */}
      {isAuthLoading || (user?.id && isSubLoading) ? (
        <div className="h-11 w-36 bg-white/10 animate-pulse rounded-lg shadow-inner" />
      ) : subscription?.planName?.toLowerCase() === "premium" && hasActiveSub ? (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 shadow-inner">
          <span>Premium Active</span>
          <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      ) : (
        <Button
          onClick={handleUpgrade}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#7C5CFF] to-[#A78BFA] hover:from-[#6B4EE6] hover:to-[#9673E6] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-transform hover:scale-105"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span>Upgrade Premium</span>
              <Crown className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
