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
import { CompactReplyItem } from "@/components/compact-reply-item";
import { useReviewReplies } from "@/hooks/use-review-replies";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUIStore } from "@/store";

// Compact component for review replies in dialog
function CompactReviewWithReplies({
  review,
  currentUserId,
  formatDate,
  showRating,
  container,
}: {
  review: any;
  currentUserId?: string;
  formatDate: (dateString: string) => string;
  showRating: boolean;
  container?: HTMLElement | null;
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
    fetchReplyCount,
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
      openLoginModal(container);
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
    <div className="space-y-2">
      {/* Reply Button - Compact */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReplyClick}
          className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 px-2 py-1 h-auto text-xs"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Reply
        </Button>
        {hasReplies && replyCount !== null && replyCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 px-2 py-1 h-auto text-xs"
          >
            {showReplies ? "Hide" : "Show"} {replyCount}{" "}
            {replyCount === 1 ? "reply" : "replies"}
          </Button>
        )}
      </div>

      {/* Reply Form - Compact */}
      {isReplying && (
        <div className="ml-2 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] bg-gray-800 border-gray-700 text-white text-xs resize-none rounded focus:border-purple-500 focus:ring-purple-500"
            placeholder="Write your reply..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReplySubmit}
              size="sm"
              disabled={!replyContent.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
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
              className="px-3 py-1 text-xs border-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies List - Compact */}
      {showReplies && (
        <div className="space-y-2 relative">
          {isRefreshing && (
            <div className="absolute top-0 right-0 z-10">
              <Spinner className="w-3 h-3 text-purple-500" />
            </div>
          )}

          {repliesLoading && replies.length === 0 ? (
            <div className="flex items-center justify-center py-2">
              <Spinner className="w-4 h-4 text-purple-500" />
            </div>
          ) : replies.length > 0 ? (
            <div
              className={`transition-opacity duration-300 ${
                isRefreshing ? "opacity-50" : "opacity-100"
              }`}
            >
              {replies.map((reply) => (
                <CompactReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onReply={handleNestedReply}
                  onEdit={(replyId: string, content: string) =>
                    updateReply(replyId, content)
                  }
                  onDelete={(replyId: string) => deleteReply(replyId)}
                  formatDate={formatDate}
                  depth={0}
                  expandedReplyIds={expandedReplies}
                  onToggleExpand={handleToggleExpanded}
                  onReplyCreated={(parentReplyId: string) => {
                    console.log(
                      "[CompactReview] Reply created:",
                      parentReplyId,
                    );
                  }}
                  replyType="review"
                  container={container}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function CompactReviewList({
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
  container,
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
  container?: HTMLElement | null;
}) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="space-y-4">
        {reviewsLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Spinner className="w-6 h-6 text-purple-500 mx-auto" />
              <p className="text-gray-400 text-sm">Loading reviews...</p>
            </div>
          </div>
        )}
        {!reviewsLoading && allReviews.length === 0 && (
          <div className="text-center py-8 bg-gray-800/50 border border-gray-700 rounded-lg">
            <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              No reviews yet. Be the first!
            </p>
          </div>
        )}
        {!reviewsLoading &&
          allReviews.length > 0 &&
          allReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-purple-500/20">
                  <AvatarImage
                    src={
                      typeof review.avatar === "string"
                        ? review.avatar
                        : undefined
                    }
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-semibold">
                    {(review.name || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {showRating && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="font-semibold text-white text-sm">
                        {review.name || "Anonymous User"}
                      </span>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-gray-400 text-xs">
                        {formatDate(review.updatedAt)}
                      </span>
                    </div>
                    {currentUserId &&
                      String(review.userId) !== String(currentUserId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setReportDialogOpen(true);
                          }}
                          onKeyDown={handleKeyDown}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                        >
                          <Flag className="w-3 h-3" />
                        </Button>
                      )}
                  </div>
                  {review.contentReviewed && (
                    <p className="text-gray-300 text-sm leading-relaxed mt-1">
                      {review.contentReviewed}
                    </p>
                  )}

                  {/* Replies Section */}
                  <CompactReviewWithReplies
                    review={review}
                    currentUserId={currentUserId}
                    formatDate={formatDate}
                    showRating={showRating}
                    container={container}
                  />
                </div>
              </div>
            </div>
          ))}
        {!reviewsLoading && allReviews.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">
              Page {currentPage} / {totalPages} ({totalReviews} reviews)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                onKeyDown={handleKeyDown}
                disabled={currentPage === 1 || reviewsLoading}
                className="h-7 w-7 p-0 border-gray-700 hover:bg-gray-800"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                onKeyDown={handleKeyDown}
                disabled={!hasMore || reviewsLoading}
                className="h-7 w-7 p-0 border-gray-700 hover:bg-gray-800"
              >
                <ChevronRight className="h-3 w-3" />
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
        container={container}
      />
    </>
  );
}
