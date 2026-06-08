"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  Copy,
  Link,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  title,
  description,
  url,
  thumbnail,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);

  if (!isOpen) return null;

  const shareData = {
    title: title,
    text: description || `Check out "${title}" on CinemaTok!`,
    url: url,
  };

  const sharePlatforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => {
        const postContent = `🎬 Đang xem: "${title}"\n\n${
          description || "Một bộ phim tuyệt vời trên CinemaTok!"
        }\n\n#CinemaTok #MovieTime #PhimHay\n\nXem ngay: ${url}`;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(postContent)}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      action: () => {
        const tweetContent = `🎬 Đang xem: "${title}"\n\n${
          description
            ? description.substring(0, 100) + "..."
            : "Một bộ phim tuyệt vời trên CinemaTok!"
        }\n\n#CinemaTok #MovieTime #PhimHay\n\nXem ngay:`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetContent
        )}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
      },
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      action: () => {
        const message = `🎬 *${title}*\n\n${
          description || "Một bộ phim tuyệt vời trên CinemaTok!"
        }\n\n#CinemaTok #MovieTime #PhimHay\n\nXem ngay: ${url}`;
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(shareUrl, "_blank");
      },
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        const message = `🎬 *${title}*\n\n${
          description || "Một bộ phim tuyệt vời trên CinemaTok!"
        }\n\n#CinemaTok #MovieTime #PhimHay\n\nXem ngay: ${url}`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(message)}`;
        window.open(shareUrl, "_blank");
      },
    },
  ];

  const generatePostContent = () => {
    return `🎬 Đang xem: "${title}"\n\n${
      description || "Một bộ phim tuyệt vời trên CinemaTok!"
    }\n\n#CinemaTok #MovieTime #PhimHay\n\nXem ngay: ${url}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyPostContent = async () => {
    try {
      await navigator.clipboard.writeText(generatePostContent());
      setCopiedPost(true);
      setTimeout(() => setCopiedPost(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generatePostContent();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedPost(true);
      setTimeout(() => setCopiedPost(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof (navigator as any).share === "function") {
      try {
        await (navigator as any).share(shareData);
        onClose();
      } catch (err) {
        // User cancelled or error occurred
        console.log("Error sharing:", err);
      }
    }
  };

  if (!isOpen) return null;

  const dialogContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[99999]" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-2xl shadow-2xl z-[100000] w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Chia sẻ</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Preview */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex gap-3">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm line-clamp-2">
                  {title}
                </h4>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {description || "Xem phim hay trên CinemaTok"}
                </p>
                <div className="mt-2 p-2 bg-gray-700 rounded text-xs text-gray-300">
                  <div className="font-medium text-white mb-1">
                    Nội dung bài viết:
                  </div>
                  🎬 Đang xem: "{title}"<br />
                  {description
                    ? description.substring(0, 50) + "..."
                    : "Một bộ phim tuyệt vời trên CinemaTok!"}
                  <br />
                  #CinemaTok #MovieTime #PhimHay
                </div>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Native Share (if supported) */}
            {typeof (navigator as any).share === "function" && (
              <Button
                onClick={handleNativeShare}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-3"
              >
                <Link className="w-5 h-5" />
                Chia sẻ với...
              </Button>
            )}

            {/* Platform Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {sharePlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.name}
                    onClick={platform.action}
                    className={`py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 ${platform.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {platform.name}
                  </Button>
                );
              })}
            </div>

            {/* Copy Link */}
            <Button
              onClick={copyToClipboard}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-3"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Sao chép liên kết
                </>
              )}
            </Button>

            {/* Copy Post Content */}
            <Button
              onClick={copyPostContent}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-3"
            >
              {copiedPost ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Đã sao chép bài viết!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Sao chép bài viết mẫu
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  // Render using portal to document.body to avoid stacking context issues
  return createPortal(dialogContent, document.body);
}
