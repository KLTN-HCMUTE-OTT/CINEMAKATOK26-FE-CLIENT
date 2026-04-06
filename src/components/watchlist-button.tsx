"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";

interface WatchlistButtonProps {
  movieId: string;
  contentId: string;
  type: "MOVIE" | "TVSERIES";
  variant?: "default" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onLoginRequired?: () => void;
}

export function WatchlistButton({
  movieId,
  contentId,
  type,
  variant = "default",
  size = "default",
  className = "",
  onLoginRequired,
}: WatchlistButtonProps) {
  const handleLoginRequired = () => {
    if (onLoginRequired) {
      onLoginRequired();
    } else {
      // Dispatch event to open login modal
      window.dispatchEvent(new Event("open-login-modal"));
    }
  };

  const { isInWatchlist, isLoading, isChecking, toggleWatchlist } =
    useWatchlist({
      movieId,
      contentId,
      type,
      autoCheck: true,
      onLoginRequired: handleLoginRequired,
    });

  const handleClick = (e: React.MouseEvent) => {
    console.log(isInWatchlist);
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist();
  };

  if (variant === "icon") {
    return (
      <Button
        size={size}
        variant="ghost"
        onClick={handleClick}
        disabled={isLoading || isChecking}
        className={`rounded-full ${className}`}
        title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        {isLoading || isChecking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isInWatchlist ? (
          <BookmarkCheck className="h-5 w-5 fill-current" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={handleClick}
      disabled={isLoading || isChecking}
      className={`flex items-center gap-2 ${className}`}
    >
      {isLoading || isChecking ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : isInWatchlist ? (
        <>
          <BookmarkCheck className="h-4 w-4 fill-current" />
          <span>In Watchlist</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span>Add to Watchlist</span>
        </>
      )}
    </Button>
  );
}
