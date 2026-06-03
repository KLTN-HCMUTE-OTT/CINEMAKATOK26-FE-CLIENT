"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Extra className */
  className?: string;
  /** Whether to show text label alongside icon */
  showLabel?: boolean;
}

/**
 * PremiumBadge — A reusable badge indicating PREMIUM content.
 * Rendered as a golden crown with optional "PREMIUM" label.
 */
export function PremiumBadge({
  size = "md",
  className,
  showLabel = false,
}: PremiumBadgeProps) {
  const sizeConfig = {
    sm: { icon: "w-3 h-3", badge: "px-1.5 py-0.5 text-[10px] gap-0.5", crown: "w-2.5 h-2.5" },
    md: { icon: "w-4 h-4", badge: "px-2 py-1 text-xs gap-1", crown: "w-3.5 h-3.5" },
    lg: { icon: "w-5 h-5", badge: "px-2.5 py-1 text-sm gap-1.5", crown: "w-4 h-4" },
  };

  const cfg = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex items-center rounded-md font-bold tracking-wide select-none",
        "bg-gradient-to-r from-yellow-500 to-amber-400",
        "shadow-[0_2px_8px_rgba(251,191,36,0.6)]",
        "text-black",
        cfg.badge,
        className
      )}
      aria-label="Premium content"
      title="Premium content – requires a Premium subscription"
    >
      <Crown
        className={cn(cfg.crown, "fill-black/20 stroke-black")}
        aria-hidden="true"
      />
      {showLabel && <span>PREMIUM</span>}
    </div>
  );
}

/** Helper: returns true when accessTier is PREMIUM */
export function isPremiumContent(accessTier?: string | null): boolean {
  return accessTier === "PREMIUM";
}
