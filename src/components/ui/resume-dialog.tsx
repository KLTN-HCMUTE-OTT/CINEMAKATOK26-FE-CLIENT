"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback } from "react";

interface ResumeDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  contentTitle: string;
  watchedDuration: number;
  totalDuration: number;
  onResume: () => void;
  onStartOver: () => void;
  onClose: () => void;
}

export function ResumeDialog({
  isOpen,
  isLoading,
  contentTitle,
  watchedDuration,
  totalDuration,
  onResume,
  onStartOver,
  onClose,
}: ResumeDialogProps) {
  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  }, []);

  const watchedPercentage =
    totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Continue Watching?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-3 mt-3">
          <div className="font-medium text-white">{contentTitle}</div>
          {totalDuration > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${watchedPercentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                  {watchedPercentage}%
                </span>
              </div>
              <div className="text-xs text-gray-400">
                You watched {formatTime(watchedDuration)} out of{" "}
                {formatTime(totalDuration)}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400">
              You watched {formatTime(watchedDuration)} seconds
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-4">
          <AlertDialogCancel
            onClick={onStartOver}
            disabled={isLoading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-0"
          >
            Start Over
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onResume}
            disabled={isLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? "Loading..." : "Continue"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
