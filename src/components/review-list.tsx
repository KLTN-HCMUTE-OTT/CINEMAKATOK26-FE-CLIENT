/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageCircle,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/ui/report-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ReplyItem } from "@/components/reply-item";
import { useReviewReplies } from "@/hooks/use-review-replies";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUIStore } from "@/store";

// Component to handle replies for a single review
function ReviewWithReplies({
  review,
  currentUserId,
  formatDate,
  showRating,
}: {
  review: any;
  currentUserId?: string;
  formatDate: (dateString: string) => string;
  showRating: boolean;
}) {
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const {
    replies,
    loading: repliesLoading,
    isRefreshing,
    replyCount,
    hasReplies,
    createReply,
    updateReply,
    deleteReply,
    fetchReplies,
  } = useReviewReplies(review.id);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showReplies && replies.length === 0 && !repliesLoading && !isRefreshing) {
      fetchReplies(1);
    }
  }, [showReplies, replies.length, repliesLoading, isRefreshing]);

  const handleReplyClick = () => {
    if (!currentUserId) {
      toast.error("Please login to reply");
      openLoginModal();
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      toast.error("Please enter your reply");
      return;
    }

    try {
      await createReply(replyContent.trim());
      // createReply already calls fetchReplies internally
      setReplyContent("");
      setIsReplying(false);
      setShowReplies(true);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleNestedReply = async (parentReplyId: string, content: string) => {
    try {
      await createReply(content, parentReplyId);
      setShowReplies(true);
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.add(parentReplyId);
        return next;
      });
    } catch (error) {
      console.error("Error submitting nested reply:", error);
      throw error;
    }
  };

  const handleToggleExpanded = (replyId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(replyId)) {
        next.delete(replyId);
      } else {
        next.add(replyId);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-3">
      {/* Reply Button */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReplyClick}
          className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 px-3 py-1 h-auto text-sm"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Reply
        </Button>
        {hasReplies && replyCount !== null && replyCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 px-3 py-1 h-auto text-sm"
          >
            {showReplies ? "Hide" : "Show"} {replyCount}{" "}
            {replyCount === 1 ? "reply" : "replies"}
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="ml-4 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] bg-gray-900/50 border-white/10 text-white text-sm resize-none rounded-lg focus:border-purple-500 focus:ring-purple-500"
            placeholder="Write your reply..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReplySubmit}
              size="sm"
              disabled={!replyContent.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 text-sm"
            >
              Submit
            </Button>
            <Button
              onClick={() => {
                setIsReplying(false);
                setReplyContent("");
              }}
              size="sm"
              variant="outline"
              className="px-4 py-1 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies List */}
      {showReplies && (
        <div className="space-y-2 relative">
          {/* Subtle loading indicator during refresh */}
          {isRefreshing && (
            <div className="absolute top-0 right-0 z-10">
              <Spinner className="w-4 h-4 text-purple-500" />
            </div>
          )}

          {repliesLoading && replies.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="w-5 h-5 text-purple-500" />
            </div>
          ) : replies.length > 0 ? (
            <div
              className={`transition-opacity duration-300 ${
                isRefreshing ? "opacity-50" : "opacity-100"
              }`}
            >
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onReply={handleNestedReply}
                  onEdit={(replyId, content) => updateReply(replyId, content)}
                  onDelete={(replyId) => deleteReply(replyId)}
                  formatDate={formatDate}
                  depth={0}
                  expandedReplyIds={expandedReplies}
                  onToggleExpand={handleToggleExpanded}
                  onReplyCreated={(parentReplyId) => {
                    console.log(
                      "[ReviewList] Reply created, parent:",
                      parentReplyId,
                    );
                    // Don't refresh all, let child components handle their own count updates
                  }}
                  replyType="review"
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function ReviewList({
  allReviews,
  reviewsLoading,
  currentPage,
  totalPages,
  totalReviews,
  hasMore,
  goToPage,
  formatDate,
  showRating = true,
  currentUserId,
  type = "REVIEW",
}: {
  allReviews: any[];
  reviewsLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  hasMore: boolean;
  goToPage: (page: number) => void;
  formatDate: (dateString: string) => string;
  showRating?: boolean;
  currentUserId?: string;
  type?: "REVIEW" | "EPISODE_REVIEW";
}) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  return (
    <>
      <div className="space-y-6 mb-3">
        {reviewsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Spinner className="w-8 h-8 text-purple-500 mx-auto" />
              <p className="text-gray-400">Loading reviews...</p>
            </div>
          </div>
        )}
        {!reviewsLoading && allReviews.length === 0 && (
          <div className="text-center py-12 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-white/5 rounded-xl mb-3">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
        {!reviewsLoading &&
          allReviews.length > 0 &&
          allReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-purple-500/20 transition-all duration-300 mb-3"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 flex-shrink-0 ring-2 ring-purple-500/20">
                  <AvatarImage
                    src={
                      typeof review.avatar === "string"
                        ? review.avatar
                        : undefined
                    }
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-semibold">
                    {(review.name || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {showRating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? "fill-purple-500 text-purple-500"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="font-semibold text-white">
                        {review.name || "Anonymous User"}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">
                        {formatDate(review.updatedAt)}
                      </span>
                    </div>
                    {/* Report button - only show for reviews not by current user */}
                    {currentUserId &&
                      String(review.userId) !== String(currentUserId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setReportDialogOpen(true);
                          }}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 h-auto"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      )}
                  </div>
                  {review.contentReviewed && (
                    <p className="text-gray-300 leading-relaxed mt-2">
                      {review.contentReviewed}
                    </p>
                  )}

                  {/* Replies Section */}
                  <ReviewWithReplies
                    review={review}
                    currentUserId={currentUserId}
                    formatDate={formatDate}
                    showRating={showRating}
                  />
                </div>
              </div>
            </div>
          ))}
        {!reviewsLoading && allReviews.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <span className="text-sm text-gray-400">
              Page {currentPage} / {totalPages} ({totalReviews} reviews)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || reviewsLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore || reviewsLoading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false);
          setSelectedReview(null);
        }}
        reviewId={selectedReview?.id || ""}
        reviewContent={selectedReview?.contentReviewed}
        reviewerName={selectedReview?.name}
        type={type}
      />
    </>
  );
}
