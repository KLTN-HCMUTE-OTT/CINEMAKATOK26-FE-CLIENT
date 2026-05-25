"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", path: "/profile/profile" },
  { id: "favorites", label: "Favorites", path: "/profile/favorites" },
  { id: "history", label: "History", path: "/profile/history" },
  { id: "watchlist", label: "Watchlist", path: "/profile/watchlist" },
  { id: "billing", label: "Billing", path: "/profile/billing" },
];

interface ProfileTabsProps {
  currentTab: string;
}

export function ProfileTabs({ currentTab }: ProfileTabsProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-white/10">
      <div className="flex gap-8">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative",
                isActive ? "text-white" : "text-gray-400 hover:text-gray-300"
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C5CFF]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
