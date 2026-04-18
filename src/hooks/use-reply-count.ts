"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewReplyControllerGetReplyCountForReply } from "@/apis/api/reviewReplies";
import { queryKeys } from "@/lib/query-keys";

export function useReplyCount(replyId: string) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.replies.count(replyId),
    queryFn: async () => {
      const response = await reviewReplyControllerGetReplyCountForReply({
        replyId,
      });
      const data = (response as any).data;
      return {
        replyCount: data?.replyCount || 0,
        hasReplies: data?.hasReplies || false,
      };
    },
    enabled: !!replyId,
    staleTime: 30 * 1000,
  });

  return {
    replyCount: data?.replyCount ?? 0,
    hasReplies: data?.hasReplies ?? false,
    isLoading,
    refetch,
  };
}
