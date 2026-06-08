import {
  ThumbsUp,
  Share2,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { Button } from "./button";
import { ShareDialog } from "./share-dialog";
import { useState } from "react";

interface Props {
  isFavorited: boolean;
  isFavoriteLoading: boolean;
  handleFavoriteToggle: () => void;
  totalFavorites: number;
  isInWatchlist: boolean;
  isWatchlistLoading: boolean;
  toggleWatchlist: () => void;
  // Share props
  shareTitle?: string;
  shareDescription?: string;
  shareUrl?: string;
  shareThumbnail?: string;
}

export function ButtonAction({
  isFavorited,
  isFavoriteLoading,
  handleFavoriteToggle,
  totalFavorites,
  isInWatchlist,
  isWatchlistLoading,
  toggleWatchlist,
  shareTitle,
  shareDescription,
  shareUrl,
  shareThumbnail,
}: Props) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Like Button (using Favorite API) */}
      <Button
        onClick={handleFavoriteToggle}
        disabled={isFavoriteLoading}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
          isFavorited
            ? "bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400"
            : "bg-gray-800 hover:bg-gray-700"
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ThumbsUp className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        <span className="flex items-center gap-1">
          {isFavorited ? "Liked" : "Like"}
          {totalFavorites > 0 && (
            <span className="text-xs opacity-80">({totalFavorites})</span>
          )}
        </span>
      </Button>

      <Button
        onClick={() => setIsShareDialogOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>

      {/* Watchlist Button with API */}
      <Button
        onClick={toggleWatchlist}
        disabled={isWatchlistLoading}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
          isInWatchlist
            ? "bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400"
            : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-purple-700 hover:to-purple-600"
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isWatchlistLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isInWatchlist ? (
          <BookmarkCheck className="w-4 h-4 fill-current" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        <span>{isInWatchlist ? "In Watchlist" : "Watch list"}</span>
      </Button>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        title={shareTitle || "CinemaTok"}
        description={shareDescription}
        url={shareUrl || window.location.href}
        thumbnail={shareThumbnail}
      />
    </div>
  );
}
