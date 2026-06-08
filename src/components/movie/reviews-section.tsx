"use client";

import { useState, useEffect } from "react";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useActions } from "@/contexts/movie-actions-context";
import { useUIStore } from "@/store";

export function ReviewsSection() {
  const auth = useAuth();
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  // Shared context
  const {
    userReview,
    allReviews,
    reviewsLoading,
    currentPage,
    totalPages,
    totalReviews,
    hasMore,
    submitReview,
    deleteReview: deleteReviewFromContext,
    loadMoreReviews,
    goToPage,
  } = useActions();

  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when userReview changes
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.contentReviewed || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [userReview]);

  // Submit review handler
  const handleSubmitReview = async () => {
    if (!auth.user) {
      toast.error("Please login to submit a review");
      openLoginModal();
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      setIsSubmitting(true);
      await submitReview(rating, comment.trim());
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review handler
  const handleDeleteReview = async () => {
    if (userReview && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await deleteReviewFromContext(userReview.id);
      } catch (err) {
        console.error("Error deleting review:", err);
      } finally {
        setIsSubmitting(false);
      }
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
      <ReviewForm
        userReview={userReview}
        rating={rating}
        setRating={setRating}
        hoveredRating={hoveredRating}
        setHoveredRating={setHoveredRating}
        comment={comment}
        setComment={setComment}
        isSubmitting={isSubmitting}
        handleSubmitReview={handleSubmitReview}
        handleDeleteReview={handleDeleteReview}
        showRating={true}
      />
      <ReviewList
        allReviews={allReviews}
        reviewsLoading={reviewsLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalReviews={totalReviews}
        hasMore={hasMore}
        goToPage={goToPage}
        formatDate={formatDate}
        showRating={true}
        currentUserId={auth.user?.id}
        type="REVIEW"
      />
    </section>
  );
}
