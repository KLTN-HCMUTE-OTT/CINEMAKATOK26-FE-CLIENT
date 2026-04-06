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
import {
  MessageCircle,
  Edit2,
  Trash2,
  X,
  Check,
  Pencil,
  Flag,
} from "lucide-react";
import { ReportDialog } from "@/components/ui/report-dialog";
import { toast } from "sonner";
import {
  reviewReplyControllerGetReplyCountForReply,
  reviewReplyControllerGetRepliesForReview,
  reviewReplyControllerGetRepliesForEpisodeReview,
} from "@/apis/api/reviewReplies";

interface CompactReplyItemProps {
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

export function CompactReplyItem({
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
}: CompactReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [fetchedReplyCount, setFetchedReplyCount] = useState<number | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const showNestedReplies = expandedReplyIds.has(reply.id);
  const isOwner =
    currentUserId && String(reply.userId) === String(currentUserId);
  const maxDepth = 3;
  const canReply = depth < maxDepth;

  const childReplyCount = fetchedReplyCount ?? reply.replyCount ?? 0;
  const hasChildReplies = childReplyCount > 0;

  const [nestedReplies, setNestedReplies] = useState<API.ReviewReplyDto[]>([]);
  const [loadingNested, setLoadingNested] = useState(false);

  useEffect(() => {
    const fetchReplyCount = async () => {
      if (fetchedReplyCount === null && reply.replyCount === undefined) {
        try {
          const response = await reviewReplyControllerGetReplyCountForReply({
            replyId: reply.id,
          });
          const data = (response as any).data?.data;
          const count = data?.replyCount ?? 0;
          setFetchedReplyCount(count);
        } catch (error) {
          console.error("Error fetching reply count:", error);
        }
      }
    };
    fetchReplyCount();
  }, [reply.id, reply.replyCount, fetchedReplyCount]);

  const [forceRefreshCount, setForceRefreshCount] = useState(0);
  useEffect(() => {
    if (forceRefreshCount > 0) {
      const fetchCount = async () => {
        try {
          const response = await reviewReplyControllerGetReplyCountForReply({
            replyId: reply.id,
          });
          const data = (response as any).data?.data;
          const count = data?.replyCount ?? 0;
          setFetchedReplyCount(count);
        } catch (error) {
          console.error("Error force fetching reply count:", error);
        }
      };
      fetchCount();
    }
  }, [forceRefreshCount, reply.id]);

  const fetchNestedReplies = async (force = false) => {
    if (!force && nestedReplies.length > 0) {
      return;
    }

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

  useEffect(() => {
    if (showNestedReplies && hasChildReplies) {
      fetchNestedReplies();
    }
  }, [showNestedReplies, hasChildReplies]);

  const handleToggleReplies = () => {
    onToggleExpand(reply.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== reply.content) {
      onEdit(reply.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleReply = async () => {
    if (replyContent.trim()) {
      await onReply(reply.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);

      setForceRefreshCount((prev) => prev + 1);
      setNestedReplies([]);
      await fetchNestedReplies(true);

      if (onReplyCreated) {
        onReplyCreated(reply.id);
      }
    }
  };

  const handleReplyCreatedInChild = (parentReplyId: string) => {
    setForceRefreshCount((prev) => prev + 1);
    if (onReplyCreated) {
      onReplyCreated(parentReplyId);
    }
  };

  return (
    <div className="ml-2 pl-2 border-l border-gray-700">
      <div className="bg-gray-800/50 rounded p-2 mb-2">
        <div className="flex items-start gap-2">
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage
              src={typeof reply.avatar === "string" ? reply.avatar : undefined}
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[10px]">
              {(reply.name || "U").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-medium text-white text-xs">
                  {reply.name}
                </span>
                <span className="text-gray-500 text-[10px]">•</span>
                <span className="text-gray-400 text-[10px]">
                  {formatDate(reply.updatedAt)}
                </span>
              </div>
              <div className="flex gap-0.5">
                {reply.userId === currentUserId ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-blue-400 p-0.5 h-auto"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-gray-400 hover:text-red-400 p-0.5 h-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportDialogOpen(true)}
                    className="text-gray-400 hover:text-red-400 p-0.5 h-auto"
                    title="Report reply"
                  >
                    <Flag className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogContent
                container={container}
                className="bg-gray-900 border-gray-800 max-w-sm"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white text-sm">
                    Delete Reply
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400 text-xs">
                    Are you sure? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700 text-xs">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(reply.id);
                      setShowDeleteDialog(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isEditing ? (
              <div className="space-y-1">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[50px] bg-gray-900 border-gray-700 text-white text-xs resize-none"
                  placeholder="Edit your reply..."
                />
                <div className="flex gap-1">
                  <Button
                    onClick={handleEdit}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-0.5 text-xs h-auto"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(reply.content);
                    }}
                    size="sm"
                    variant="outline"
                    className="px-2 py-0.5 text-xs h-auto border-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-xs leading-relaxed">
                {reply.content}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1">
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  onKeyDown={handleKeyDown}
                  className="text-gray-400 hover:text-purple-400 text-[10px] flex items-center gap-0.5"
                >
                  <MessageCircle className="w-3 h-3" />
                  Reply
                </button>
              )}
              {hasChildReplies && (
                <button
                  onClick={handleToggleReplies}
                  onKeyDown={handleKeyDown}
                  className="text-purple-400 hover:text-purple-300 text-[10px] flex items-center gap-0.5"
                >
                  {showNestedReplies ? "Hide" : "Show"} {childReplyCount}{" "}
                  {childReplyCount === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="mt-2 ml-8 space-y-1">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[50px] bg-gray-900 border-gray-700 text-white text-xs resize-none"
              placeholder={`Reply to ${reply.name}...`}
            />
            <div className="flex gap-1">
              <Button
                onClick={handleReply}
                size="sm"
                disabled={!replyContent.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-0.5 text-xs h-auto"
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
                className="px-2 py-0.5 text-xs h-auto border-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {showNestedReplies && nestedReplies.length > 0 && (
        <div className="space-y-1">
          {nestedReplies.map((childReply) => (
            <CompactReplyItem
              key={childReply.id}
              reply={childReply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
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
