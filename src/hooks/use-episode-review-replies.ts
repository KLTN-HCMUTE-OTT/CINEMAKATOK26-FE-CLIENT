"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewReplyControllerGetRepliesForEpisodeReview,
  reviewReplyControllerCreateReply,
  reviewReplyControllerUpdateReply,
  reviewReplyControllerDeleteReply,
  reviewReplyControllerGetReplyCountForEpisodeReview,
} from "@/apis/api/reviewReplies";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

export function useEpisodeReviewReplies(episodeReviewId: string) {
  const queryClient = useQueryClient();

  // Fetch replies query
  const repliesQuery = useQuery({
    queryKey: queryKeys.replies.forEpisodeReview(episodeReviewId, 1),
    queryFn: async () => {
      const params: any = {
        episodeReviewId,
        page: 1,
        limit: 10,
        parentReplyId: "null",
      };
      const response =
        await reviewReplyControllerGetRepliesForEpisodeReview(params);
      const data = (response as any).data;
      return {
        replies: (data?.data ?? []) as API.ReviewReplyDto[],
        totalPages: data?.meta?.totalPages || 1,
        totalReplies: data?.meta?.total || 0,
      };
    },
    enabled: !!episodeReviewId,
    staleTime: 30 * 1000,
  });

  // Reply count query
  const countQuery = useQuery({
    queryKey: queryKeys.replies.episodeCount(episodeReviewId),
    queryFn: async () => {
      const response =
        await reviewReplyControllerGetReplyCountForEpisodeReview({
          episodeReviewId,
        });
      const data =
        (response as any).data?.data || (response as any).data || response;
      return {
        replyCount: data?.replyCount || 0,
        hasReplies: data?.hasReplies || false,
      };
    },
    enabled: !!episodeReviewId,
    staleTime: 30 * 1000,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.replies.forEpisodeReview(episodeReviewId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.replies.episodeCount(episodeReviewId),
    });
  };

  // Create reply mutation
  const createMutation = useMutation({
    mutationFn: async ({
      content,
      parentReplyId,
    }: {
      content: string;
      parentReplyId?: string;
    }) => {
      const response = await reviewReplyControllerCreateReply({
        content,
        episodeReviewId,
        parentReplyId,
      });
      return (response as any).data?.data;
    },
    onSuccess: () => {
      toast.success("Reply added successfully");
      invalidateAll();
    },
    onError: () => {
      toast.error("Failed to submit reply");
    },
  });

  // Update reply mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      replyId,
      content,
    }: {
      replyId: string;
      content: string;
    }) => {
      const response = await reviewReplyControllerUpdateReply(
        { id: replyId },
        { content },
      );
      return (response as any).data?.data;
    },
    onSuccess: () => {
      toast.success("Reply updated successfully");
      invalidateAll();
    },
    onError: () => {
      toast.error("Failed to update reply");
    },
  });

  // Delete reply mutation
  const deleteMutation = useMutation({
    mutationFn: async (replyId: string) => {
      await reviewReplyControllerDeleteReply({ id: replyId });
    },
    onSuccess: () => {
      toast.success("Reply deleted successfully");
      invalidateAll();
    },
    onError: () => {
      toast.error("Failed to delete reply");
    },
  });

  return {
    replies: repliesQuery.data?.replies ?? [],
    loading: repliesQuery.isLoading,
    isRefreshing: repliesQuery.isFetching && !repliesQuery.isLoading,
    currentPage: 1,
    totalPages: repliesQuery.data?.totalPages ?? 0,
    totalReplies: repliesQuery.data?.totalReplies ?? 0,
    replyCount: countQuery.data?.replyCount ?? null,
    hasReplies: countQuery.data?.hasReplies ?? false,
    fetchReplies: (page?: number, parentReplyId?: string) =>
      repliesQuery.refetch(),
    fetchReplyCount: () => countQuery.refetch(),
    createReply: (content: string, parentReplyId?: string) =>
      createMutation.mutateAsync({ content, parentReplyId }),
    updateReply: (replyId: string, content: string) =>
      updateMutation.mutateAsync({ replyId, content }),
    deleteReply: (replyId: string) => deleteMutation.mutateAsync(replyId),
  };
}
