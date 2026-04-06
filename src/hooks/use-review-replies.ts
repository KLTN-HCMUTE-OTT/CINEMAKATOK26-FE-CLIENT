"use client";

import { useState, useCallback } from "react";
import {
  reviewReplyControllerGetRepliesForReview,
  reviewReplyControllerCreateReply,
  reviewReplyControllerUpdateReply,
  reviewReplyControllerDeleteReply,
  reviewReplyControllerGetReplyCountForReview,
} from "@/apis/api/reviewReplies";
import { toast } from "sonner";

export function useReviewReplies(reviewId: string) {
  const [replies, setReplies] = useState<API.ReviewReplyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReplies, setTotalReplies] = useState(0);
  const [replyCount, setReplyCount] = useState<number | null>(null);
  const [hasReplies, setHasReplies] = useState(false);

  // Fetch replies for a review
  const fetchReplies = useCallback(
    async (page: number = 1, parentReplyId?: string) => {
      // Only show loading spinner on initial load
      if (replies.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      try {
        // When fetching without parentReplyId, explicitly set to "null" for top-level
        const params: any = {
          reviewId,
          page,
          limit: 10,
        };

        // Only add parentReplyId if explicitly provided, otherwise use "null" for top-level
        if (parentReplyId !== undefined) {
          params.parentReplyId = parentReplyId;
        } else {
          params.parentReplyId = "null"; // Fetch only top-level replies
        }

        const response = await reviewReplyControllerGetRepliesForReview(params);

        const data = (response as any).data;

        if (data?.data) {
          setReplies(data.data);
          setCurrentPage(page);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalReplies(data.meta?.total || 0);
        }
      } catch (error: any) {
        console.error("Error fetching replies:", error);
        toast.error("Failed to load replies");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [reviewId, replies.length]
  );

  // Fetch reply count
  const fetchReplyCount = useCallback(async () => {
    try {
      const response = await reviewReplyControllerGetReplyCountForReview({
        reviewId,
      });

      // Check different response structures
      const data =
        (response as any).data?.data || (response as any).data || response;

      if (data) {
        const count = data.replyCount || 0;
        const hasRep = data.hasReplies || false;
        setReplyCount(count);
        setHasReplies(hasRep);
      }
    } catch (error: any) {
      console.error("Error fetching reply count:", error);
      setReplyCount(0);
      setHasReplies(false);
    }
  }, [reviewId]);

  // Create a new reply
  const createReply = useCallback(
    async (content: string, parentReplyId?: string) => {
      try {
        const response = await reviewReplyControllerCreateReply({
          content,
          reviewId,
          parentReplyId,
        });

        const data = (response as any).data;
        if (data?.data) {
          toast.success(" Reply added successfully");
          // Always refresh top-level replies - use page 1 to ensure we see the new reply
          await fetchReplies(1);
          await fetchReplyCount();
          return data.data;
        }
      } catch (error: any) {
        console.error("Error creating reply:", error);
        toast.error(" Failed to submit reply");
        throw error;
      }
    },
    [reviewId, currentPage, fetchReplies, fetchReplyCount]
  );

  // Update a reply
  const updateReply = useCallback(
    async (replyId: string, content: string) => {
      try {
        const response = await reviewReplyControllerUpdateReply(
          { id: replyId },
          { content }
        );

        const data = (response as any).data;
        if (data?.data) {
          toast.success(" Reply updated successfully");
          // Refresh replies
          await fetchReplies(currentPage);
          return data.data;
        }
      } catch (error: any) {
        console.error("Error updating reply:", error);
        toast.error(" Failed to update reply");
        throw error;
      }
    },
    [currentPage, fetchReplies]
  );

  // Delete a reply
  const deleteReply = useCallback(
    async (replyId: string) => {
      try {
        await reviewReplyControllerDeleteReply({ id: replyId });
        toast.success(" Reply deleted successfully");
        // Refresh replies and count
        await fetchReplies(currentPage);
        await fetchReplyCount();
      } catch (error: any) {
        console.error("Error deleting reply:", error);
        toast.error(" Failed to delete reply");
        throw error;
      }
    },
    [currentPage, fetchReplies, fetchReplyCount]
  );

  return {
    replies,
    loading,
    isRefreshing,
    currentPage,
    totalPages,
    totalReplies,
    replyCount,
    hasReplies,
    fetchReplies,
    fetchReplyCount,
    createReply,
    updateReply,
    deleteReply,
  };
}
