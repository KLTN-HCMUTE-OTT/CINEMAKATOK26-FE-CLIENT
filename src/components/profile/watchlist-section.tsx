"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { WatchListCard } from "../watch-list-card";
import { Button } from "../ui/button";

import { useUserWatchlist } from "@/hooks/use-user-watchlist";

export function WatchlistSection() {
  const {
    watchlist,
    isLoading,
    isDeleting,
    removeMultipleFromWatchlist,
    refetch,
  } = useUserWatchlist({
    page: 1,
    limit: 100,
    autoFetch: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!isEditing) return;
    setSelectedIds((prev) =>
      prev.length === watchlist.length ? [] : watchlist.map((m) => m.id)
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedIds([]);
  };

  const handleDelete = async () => {
    if (!isEditing || selectedIds.length === 0) return;

    try {
      console.log("Deleting selected IDs:", selectedIds);
      console.log("Current watchlist:", watchlist);
      // Get movieContentIds from selected ids
      const movieContentIds = watchlist
        .filter((movie) => selectedIds.includes(movie.id))
        .map((movie) => movie.movieContentId);

      console.log("MovieContentIds to delete:", movieContentIds);
      await removeMultipleFromWatchlist(movieContentIds);

      setSelectedIds([]);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to delete items:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Your watchlist is empty</p>
        <p className="text-sm text-gray-500 mt-2">
          Browse movies and add them to your watchlist
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 mb-6">
        {/* Dòng tiêu đề */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">My Watchlist</h2>

          {/* Nút bên phải */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-5 text-gray-200 hover:text-white"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="px-5 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handleDelete}
                  disabled={selectedIds.length === 0 || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="px-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Toggle Select All chỉ hiển thị khi đang edit */}
        {isEditing && (
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors self-end"
          >
            {selectedIds.length === watchlist.length ? (
              <CheckCircle2 className="h-5 w-5 text-purple-400" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
            Select all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {watchlist.map((movie) => (
          <WatchListCard
            key={movie.id}
            movie={movie}
            isEditing={isEditing}
            isSelected={selectedIds.includes(movie.id)}
            onToggleSelect={toggleSelection}
          />
        ))}
      </div>
    </div>
  );
}
