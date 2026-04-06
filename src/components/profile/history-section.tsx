/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { HistoryCard } from "../history-card";
import { Button } from "../ui/button";
import {
  watchProgressControllerGetAllWatchProgress,
  watchProgressControllerDeleteWatchProgress,
} from "@/apis/api/watchProgress";
import { toast } from "sonner";

export function HistorySection() {
  const [history, setHistory] = useState<API.WatchProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);

        // Fetch watch history with pagination (default params)
        const response = await watchProgressControllerGetAllWatchProgress({
          page: 1,
          limit: 20, // Get up to 20 items
          sort: JSON.stringify({ lastWatched: "DESC" }), // Sort by last watched, newest first
        });
        if (response.data.data && Array.isArray(response.data.data)) {
          setHistory(response.data.data);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
        setError("Failed to load watch history");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!isEditing) return;
    setSelectedIds((prev) =>
      prev.length === history.length ? [] : history.map((item) => item.id)
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedIds([]);
  };

  const handleDelete = async () => {
    if (!isEditing || selectedIds.length === 0) return;

    try {
      setIsDeleting(true);

      // Delete selected items from watch history
      const deletePromises = selectedIds.map((id) => {
        const progressItem = history.find((item) => item.id === id);
        if (progressItem) {
          return watchProgressControllerDeleteWatchProgress({
            videoId: progressItem.videoId,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(deletePromises);

      // Remove deleted items from local state
      setHistory((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id))
      );
      setSelectedIds([]);
      setIsEditing(false);

      toast.success(`Removed ${selectedIds.length} item(s) from watch history`);
    } catch (error) {
      console.error("Failed to delete items:", error);
      toast.error("Failed to delete selected items");
      setError("Failed to delete selected items");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  console.log("Watch History:", history);
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No watch history yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 mb-6">
        {/* Dòng tiêu đề */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">My Watch History</h2>

          {/* Nút bên phải */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-5 text-gray-200 hover:text-white"
                  onClick={handleCancel}
                  disabled={isDeleting}
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
            {selectedIds.length === history.length ? (
              <CheckCircle2 className="h-5 w-5 text-purple-400" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
            Select all
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No watch history yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {history.map((item) => (
            <HistoryCard
              key={item.id}
              progress={item}
              isEditing={isEditing}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
