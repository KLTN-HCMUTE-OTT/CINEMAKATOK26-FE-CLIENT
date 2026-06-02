/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageCircle, Edit2, Trash2, X, Check, Flag } from "lucide-react";
import { toast } from "sonner";
import { ReportDialog } from "@/components/ui/report-dialog";
import {
  reviewReplyControllerGetReplyCountForReply,
  reviewReplyControllerGetRepliesForReview,
  reviewReplyControllerGetRepliesForEpisodeReview,
} from "@/apis/api/reviewReplies";
import { useUIStore } from "@/store";

interface ReplyItemProps {
  reply: API.ReviewReplyDto;
  currentUserId?: string;
  onReply: (parentReplyId: string, content: string) => void;
  onEdit: (replyId: string, content: string) => void;
  onDelete: (replyId: string) => void;
  formatDate: (dateString: string) => string;
  depth?: number;
  expandedReplyIds: Set<string>;
  onToggleExpand: (replyId: string) => void;
  onReplyCreated?: (parentReplyId: string) => void;
  replyType?: "review" | "episodeReview";
  container?: HTMLElement | null;
}

export function ReplyItem({
  reply,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  formatDate,
  depth = 0,
  expandedReplyIds,
  onToggleExpand,
  onReplyCreated,
  replyType = "review",
  container,
}: ReplyItemProps) {
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [fetchedReplyCount, setFetchedReplyCount] = useState<number | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Use parent's expanded state instead of local state
  const showNestedReplies = expandedReplyIds.has(reply.id);

  const isOwner =
    currentUserId && String(reply.userId) === String(currentUserId);
  const maxDepth = 3; // Maximum nesting level
  const canReply = depth < maxDepth;

  // Check if reply has child replies - use replyCount from API or fetched count
  const childReplyCount = fetchedReplyCount ?? reply.replyCount ?? 0;
  const hasChildReplies = childReplyCount > 0;

  // State to store fetched nested replies
  const [nestedReplies, setNestedReplies] = useState<API.ReviewReplyDto[]>([]);
  const [loadingNested, setLoadingNested] = useState(false);

  // Fetch reply count if not available from API response or when explicitly reset to null
  useEffect(() => {
    const fetchReplyCount = async () => {
      // Always fetch when fetchedReplyCount is null
      // This happens on mount (if replyCount undefined) or when manually reset
      if (fetchedReplyCount === null && reply.replyCount === undefined) {
        try {
          console.log("[ReplyItem] Fetching count for reply:", reply.id);
          const response = await reviewReplyControllerGetReplyCountForReply({
            replyId: reply.id,
          });
          const data = (response as any).data?.data;
          const count = data?.replyCount ?? 0;
          console.log("[ReplyItem] Fetched count:", data, "extracted:", count);
          setFetchedReplyCount(count);
        } catch (error) {
          console.error("Error fetching reply count:", error);
          setFetchedReplyCount(0);
        }
      }
    };

    fetchReplyCount();
  }, [reply.id, reply.replyCount, fetchedReplyCount]);

  // Separate effect to force refresh count when explicitly requested
  const [forceRefreshCount, setForceRefreshCount] = useState(0);
  useEffect(() => {
    if (forceRefreshCount > 0) {
      const fetchCount = async () => {
        try {
          console.log("[ReplyItem] Force fetching count for reply:", reply.id);
          const response = await reviewReplyControllerGetReplyCountForReply({
            replyId: reply.id,
          });
          const data = (response as any).data?.data;
          const count = data?.replyCount ?? 0;
          console.log(
            "[ReplyItem] Force fetched count:",
            data,
            "extracted:",
            count,
          );
          setFetchedReplyCount(count);
        } catch (error) {
          console.error("Error force fetching reply count:", error);
        }
      };
      fetchCount();
    }
  }, [forceRefreshCount, reply.id]);

  // Fetch nested replies when user clicks to expand
  const fetchNestedReplies = async (force = false) => {
    if (!force && nestedReplies.length > 0) {
      console.log("[ReplyItem] Skip fetch - already loaded");
      return; // Already fetched
    }

    console.log(
      "[ReplyItem] Fetching nested replies for:",
      reply.id,
      "force:",
      force,
      "type:",
      replyType,
    );
    setLoadingNested(true);
    try {
      let response;
      if (replyType === "episodeReview" && reply.episodeReviewId) {
        response = await reviewReplyControllerGetRepliesForEpisodeReview({
          episodeReviewId: String(reply.episodeReviewId),
          parentReplyId: reply.id,
          page: 1,
          limit: 10,
        });
      } else if (reply.reviewId) {
        response = await reviewReplyControllerGetRepliesForReview({
          reviewId: String(reply.reviewId),
          parentReplyId: reply.id,
          page: 1,
          limit: 10,
        });
      }

      if (response) {
        const data = (response as any).data;
        if (data?.data) {
          console.log("[ReplyItem] Fetched nested replies:", data.data.length);
          setNestedReplies(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching nested replies:", error);
      toast.error("Failed to load replies");
    } finally {
      setLoadingNested(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(reply.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleReply = async () => {
    if (replyContent.trim()) {
      const wasExpanded = showNestedReplies;
      console.log("[ReplyItem] handleReply START:", {
        replyId: reply.id,
        wasExpanded,
        nestedRepliesCount: nestedReplies.length,
      });

      await onReply(reply.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);

      // Force refresh count to update the badge immediately
      console.log(
        "[ReplyItem] handleReply - forcing count refresh for:",
        reply.id,
      );
      setForceRefreshCount((prev) => prev + 1);

      // Always force refetch nested replies to show the new one and maintain expand state
      console.log(
        "[ReplyItem] Force refetching nested replies, wasExpanded:",
        wasExpanded,
      );
      setNestedReplies([]);
      await fetchNestedReplies(true); // Force refetch

      // Notify parent to refresh its count
      if (onReplyCreated) {
        onReplyCreated(reply.id);
      }

      console.log("[ReplyItem] handleReply END");
    }
  };

  const handleReplyClick = () => {
    if (!currentUserId) {
      toast.error("Please login to reply");
      openLoginModal(container);
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleChildDelete = async (replyId: string) => {
    await (onDelete(replyId) as unknown as Promise<void>);
    setNestedReplies((prev) => prev.filter((r) => r.id !== replyId));
    setFetchedReplyCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
  };

  const handleChildEdit = async (replyId: string, content: string) => {
    await (onEdit(replyId, content) as unknown as Promise<void>);
    setNestedReplies((prev) =>
      prev.map((r) => (r.id === replyId ? { ...r, content } : r)),
    );
  };

  const handleReplyCreatedInChild = (parentReplyId: string) => {
    console.log("[ReplyItem] handleReplyCreatedInChild called:", {
      myReplyId: reply.id,
      parentReplyId,
      matches: parentReplyId === reply.id,
    });
    // If this reply is the parent, refresh count
    if (parentReplyId === reply.id) {
      console.log("[ReplyItem] Force refreshing count for reply:", reply.id);
      setForceRefreshCount((prev) => prev + 1);
    }
    // Propagate up to parent
    if (onReplyCreated) {
      onReplyCreated(parentReplyId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`${depth > 0 ? "ml-8 mt-3" : "mt-3"} space-y-2`}>
      <div className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-white/5 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-purple-500/20">
            <AvatarImage
              src={typeof reply.avatar === "string" ? reply.avatar : undefined}
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
              {(reply.name || "U").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">
                  {reply.name || "Anonymous User"}
                </span>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-gray-400 text-xs">
                  {formatDate(reply.updatedAt)}
                </span>
                {hasChildReplies && childReplyCount > 0 && (
                  <>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-purple-400 text-xs">
                      {childReplyCount}{" "}
                      {childReplyCount === 1 ? "reply" : "replies"}
                    </span>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex gap-1">
                  {isOwner ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-1 h-auto"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReportDialogOpen(true)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                      title="Report reply"
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogContent className="bg-gray-900 border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Delete Reply
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to delete this reply? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(reply.id);
                      setShowDeleteDialog(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[80px] bg-gray-900/50 border-white/10 text-white text-sm resize-none rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Edit your reply..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(reply.content);
                    }}
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {reply.content}
                </p>
                <div className="flex gap-2">
                  {canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReplyClick}
                      className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 p-0 h-auto text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}
                  {hasChildReplies && childReplyCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onToggleExpand(reply.id);
                        if (!showNestedReplies) {
                          fetchNestedReplies();
                        }
                      }}
                      className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 p-0 h-auto text-xs"
                    >
                      {showNestedReplies ? "Hide" : "Show"} {childReplyCount}{" "}
                      {childReplyCount === 1 ? "reply" : "replies"}
                    </Button>
                  )}
                  {loadingNested && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 ml-13 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] bg-gray-900/50 border-white/10 text-white text-sm resize-none rounded-lg focus:border-purple-500 focus:ring-purple-500"
              placeholder={`Reply to ${reply.name}...`}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleReply}
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
                className="px-3 py-1 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Nested Replies - only show if expanded and loaded */}
      {showNestedReplies && nestedReplies.length > 0 && (
        <div className="space-y-2">
          {nestedReplies.map((childReply) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={handleChildEdit}
              onDelete={handleChildDelete}
              formatDate={formatDate}
              depth={depth + 1}
              expandedReplyIds={expandedReplyIds}
              onToggleExpand={onToggleExpand}
              onReplyCreated={handleReplyCreatedInChild}
              replyType={replyType}
              container={container}
            />
          ))}
        </div>
      )}
      {/* Debug: Show reply info from level 2+
      {process.env.NODE_ENV === \"development\" && depth >= 1 && (
        <div className=\"text-xs text-gray-500 mt-1 p-2 bg-gray-900/30 rounded\">
          [Debug Level {depth + 1}] Reply ID: {reply.id.substring(0, 8)}... |
          API replyCount: {reply.replyCount ?? \"undefined\"} | Fetched count:{\" \"}
          {fetchedReplyCount ?? \"null\"} | Final childReplyCount:{\" \"}
          {childReplyCount} | hasChildReplies: {hasChildReplies.toString()} |
          nestedReplies loaded: {nestedReplies.length} | loadingNested:{\" \"}
          {loadingNested.toString()} | showNestedReplies:{\" \"}
          {showNestedReplies.toString()}
        </div>
      )} */}

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        reviewId={reply.id}
        reviewContent={reply.content}
        reviewerName={reply.name}
        type="REVIEW_REPLY"
        container={container}
      />
    </div>
  );
}
