"use client";

import React, { useState, useEffect } from "react";
import { X, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CompactReviewList } from "@/components/compact-review-list";
import { useActions } from "@/contexts/movie-actions-context";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  container?: HTMLElement | null;
}

export function RatingDialog({
  isOpen,
  onClose,
  container,
}: RatingDialogProps) {
  const auth = useAuth();
  const {
    userReview,
    allReviews,
    reviewsLoading,
    currentPage,
    totalPages,
    totalReviews,
    hasMore,
    submitReview,
    deleteReview,
    loadMoreReviews,
    goToPage,
  } = useActions();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's existing review into form when dialog opens
  useEffect(() => {
    if (isOpen && userReview) {
      setRating(userReview.rating || 0);
      setReview(userReview.contentReviewed || "");
    } else if (isOpen && !userReview) {
      // Reset form when opening without existing review
      setRating(0);
      setReview("");
    }
  }, [isOpen, userReview]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent keyboard shortcuts from interfering with form input
    e.stopPropagation();
  };

  const handleSubmit = async () => {
    if (rating > 0 && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await submitReview(rating, review.trim());
        onClose();
      } catch (err) {
        // Error is handled in context
        console.error("Submit error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    if (userReview && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await deleteReview(userReview.id);
        setRating(0);
        setReview("");
      } catch (err) {
        console.error("Delete error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[9998] ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[400px] bg-gray-900 shadow-2xl z-[9999] transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Đánh giá phim</h2>
            <button
              onClick={onClose}
              onKeyDown={handleKeyDown}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Star Rating */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  {userReview ? "Chỉnh sửa đánh giá" : "Đánh giá của bạn"}
                </label>
                {userReview && (
                  <button
                    onClick={handleDelete}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm text-gray-400 ml-2">{rating}/5</span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Nhận xét <span className="text-gray-500">(không bắt buộc)</span>
              </label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                placeholder="Chia sẻ suy nghĩ của bạn về bộ phim..."
                className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            {/* Separator */}
            <div className="border-t border-gray-700 my-6"></div>

            {/* All Reviews Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Đánh giá từ người dùng ({totalReviews})
              </h3>

              <div className="max-h-[500px] overflow-y-auto pr-2">
                <CompactReviewList
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
                  container={container}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              className="flex-1 border-gray-700 text-white hover:bg-gray-800"
            >
              {userReview || allReviews.length > 0 ? "Đóng" : "Hủy"}
            </Button>
            <Button
              onClick={handleSubmit}
              onKeyDown={handleKeyDown}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              {isSubmitting
                ? "Đang gửi..."
                : userReview
                ? "Cập nhật"
                : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
