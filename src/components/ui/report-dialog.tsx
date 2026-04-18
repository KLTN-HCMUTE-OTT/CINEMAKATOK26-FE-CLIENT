"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Flag,
  X,
  AlertTriangle,
  MessageSquare,
  UserX,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reportControllerCreate } from "@/apis/api/reports";
import { toast } from "sonner";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  reviewContent?: string;
  reviewerName?: string;
  type?: "REVIEW" | "EPISODE_REVIEW" | "REVIEW_REPLY";
  container?: HTMLElement | null;
}

export function ReportDialog({
  isOpen,
  onClose,
  reviewId,
  reviewContent,
  reviewerName,
  type = "REVIEW",
  container,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    {
      id: "SPAM",
      label: "Spam or advertising",
      description: "Spam content, advertising, or irrelevant links",
      icon: MessageSquare,
    },
    {
      id: "HARASSMENT",
      label: "Harassment or threats",
      description: "Offensive content, threats, or discriminatory behavior",
      icon: AlertTriangle,
    },
    {
      id: "INAPPROPRIATE_CONTENT",
      label: "Inappropriate content",
      description: "Pornographic, violent, or age-inappropriate content",
      icon: Flag,
    },
    {
      id: "OTHER",
      label: "Other reason",
      description: "Please describe the issue in detail below",
      icon: Flag,
    },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    try {
      setIsSubmitting(true);
      await reportControllerCreate({
        type,
        targetId: reviewId,
        reason: selectedReason as
          | "SPAM"
          | "HARASSMENT"
          | "INAPPROPRIATE_CONTENT"
          | "OTHER",
        details: additionalDetails.trim() || undefined,
      });

      toast.success(
        "Report submitted successfully. We will review it as soon as possible."
      );
      onClose();
      setSelectedReason("");
      setAdditionalDetails("");
    } catch (error: any) {
      console.error("Error reporting review:", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while submitting the report"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const dialogContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 !z-[2147483647]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl shadow-2xl !z-[2147483647] w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Report Review
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Review Preview */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Review by:</div>
            <div className="font-medium text-white mb-2">
              {reviewerName || "Anonymous User"}
            </div>
            {reviewContent && (
              <div className="text-gray-300 text-sm line-clamp-3 bg-gray-700 p-2 rounded">
                {reviewContent}
              </div>
            )}
          </div>

          {/* Report Reasons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Report Reason *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedReason === reason.id
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          selectedReason === reason.id
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{reason.label}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {reason.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Additional Details (Optional)
            </label>
            <Textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="min-h-[80px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Your report will be reviewed by our moderation team. We take
            inappropriate content seriously and will take appropriate action if
            necessary.
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, container || document.body);
}
