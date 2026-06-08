/* eslint-disable @typescript-eslint/no-explicit-any */
// ReviewForm.tsx
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export function ReviewForm({
  userReview,
  rating,
  setRating,
  hoveredRating,
  setHoveredRating,
  comment,
  setComment,
  isSubmitting,
  handleSubmitReview,
  handleDeleteReview,
  showRating = true,
}: {
  userReview: any;
  rating: number;
  setRating: (n: number) => void;
  hoveredRating: number;
  setHoveredRating: (n: number) => void;
  comment: string;
  setComment: (s: string) => void;
  isSubmitting: boolean;
  handleSubmitReview: () => void;
  handleDeleteReview: () => void;
  showRating?: boolean;
}) {
  // Prevent video keyboard shortcuts when typing in form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Stop propagation to prevent video player shortcuts
    e.stopPropagation();
  };

  return (
    <div
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 review-form"
      data-review-form
      onKeyDown={handleKeyDown}
    >
      <h3 className="text-2xl font-bold text-white">
        {showRating ? "Add Review" : "Add Comment"}
      </h3>
      <p className="text-gray-400 text-sm">
        Share your thoughts about this {showRating ? "movie" : "episode"}
      </p>
      {/* Star Rating Input */}
      {showRating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white text-sm font-medium">
              {userReview ? "Edit Review" : "Your Review"}{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                onKeyDown={handleKeyDown}
                className="transition-transform hover:scale-110"
                disabled={isSubmitting}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-purple-500 text-purple-500"
                      : "text-gray-600 hover:text-purple-400"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-gray-400 text-sm">
                {rating}/5 stars
              </span>
            )}
          </div>
        </div>
      )}
      {/* Comment Input */}
      <div className="space-y-2">
        <label className="text-white text-sm font-medium">
          Content {showRating ? "review" : "comment"}{" "}
          <span className="text-gray-500">(optional)</span>
        </label>
        <Textarea
          placeholder={`Share your thoughts about this ${
            showRating ? "movie" : "episode"
          }...`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[120px] bg-gray-900/50 border-white/10 text-white placeholder:text-gray-500 resize-none rounded-lg focus:border-purple-500 focus:ring-purple-500"
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* Submit Button */}
      <div className="flex gap-3">
        {userReview && (
          <Button
            onClick={handleDeleteReview}
            disabled={isSubmitting}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            onKeyDown={handleKeyDown}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {showRating ? "review" : "comment"}
          </Button>
        )}
        <Button
          onClick={handleSubmitReview}
          disabled={isSubmitting || (showRating && rating === 0)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onKeyDown={handleKeyDown}
        >
          {isSubmitting ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              {userReview ? "Updating..." : "Submitting..."}
            </>
          ) : userReview ? (
            `Update ${showRating ? "review" : "comment"}`
          ) : (
            `Submit ${showRating ? "review" : "comment"}`
          )}
        </Button>
      </div>
    </div>
  );
}
