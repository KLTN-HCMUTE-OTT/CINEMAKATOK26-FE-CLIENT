"use client";

import { useState, useCallback, useEffect } from "react";
import { reviewReplyControllerGetReplyCountForReply } from "@/apis/api/reviewReplies";

export function useReplyCount(replyId: string) {
  const [replyCount, setReplyCount] = useState<number>(0);
  const [hasReplies, setHasReplies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reviewReplyControllerGetReplyCountForReply({
        replyId,
      });

      const data = (response as any).data;
      if (data) {
        setReplyCount(data.replyCount || 0);
        setHasReplies(data.hasReplies || false);
      }
    } catch (error: any) {
      console.error("Error fetching reply count:", error);
      setReplyCount(0);
      setHasReplies(false);
    } finally {
      setIsLoading(false);
    }
  }, [replyId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    replyCount,
    hasReplies,
    isLoading,
    refetch: fetchCount,
  };
}
