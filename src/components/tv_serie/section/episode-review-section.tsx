/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ReviewForm } from "@/components/review-form";
import { EpisodeReviewList } from "@/components/episode-review-list";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  EpisodeReviewProvider,
  useEpisodeReview,
} from "@/contexts/episode-review-context";
import { useUIStore } from "@/store";

function EpisodeReviewContent({ episodeId }: { episodeId: string }) {
  const auth = useAuth();
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const {
    userReview,
    allReviews,
    reviewsLoading,
    currentPage,
    totalPages,
    totalReviews,
    hasMore,
    sortOrder,
    setSortOrder,
    submitReview,
    deleteReview,
    goToPage,
  } = useEpisodeReview();

  // Form state
  const [comment, setComment] = useState("");

  // Update form when userReview changes
  useEffect(() => {
    if (userReview) {
      setComment(userReview.contentReviewed || "");
    } else {
      setComment("");
    }
  }, [userReview]);

  // Submit review handler
  const handleSubmitReview = async () => {
    if (!auth.user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá");
      openLoginModal();
      return;
    }
    try {
      await submitReview(comment.trim());
    } catch (err) {
      // Error already handled in context
    }
  };

  // Delete review handler
  const handleDeleteReview = async () => {
    if (!userReview) return;
    try {
      await deleteReview(userReview.id);
      setComment("");
    } catch (err) {
      // Error already handled in context
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <section className="space-y-8">
      {/* Review input box like YouTube */}
      <div className="bg-white/5 rounded-xl p-6 mb-2">
        <ReviewForm
          userReview={userReview}
          rating={0}
          setRating={() => {}}
          hoveredRating={0}
          setHoveredRating={() => {}}
          comment={comment}
          setComment={setComment}
          isSubmitting={false}
          handleSubmitReview={handleSubmitReview}
          handleDeleteReview={handleDeleteReview}
          showRating={false}
        />
      </div>
      {/* Review count and sort bar */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-white/10">
        <span className="font-semibold text-lg text-white">
          {totalReviews} Comment
        </span>
        {/* Sort dropdown placeholder, có thể thêm logic sort nếu muốn */}
        <select
          className="bg-transparent text-gray-300 border-none outline-none"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as "newest" | "oldest");
          }}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>
      {/* Review list */}
      <EpisodeReviewList
        allReviews={allReviews}
        reviewsLoading={reviewsLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalReviews={totalReviews}
        hasMore={hasMore}
        goToPage={goToPage}
        formatDate={formatDate}
        currentUserId={auth.user?.id}
      />
    </section>
  );
}

interface EpisodeReviewSectionProps {
  episodeId: string;
}

export function EpisodeReviewSection({ episodeId }: EpisodeReviewSectionProps) {
  return (
    <EpisodeReviewProvider episodeId={episodeId}>
      <EpisodeReviewContent episodeId={episodeId} />
    </EpisodeReviewProvider>
  );
}
