import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

// Types

interface DialogTrailerProps {
  title: string;
  trailerUrl: string;
  trailerDialogOpen: boolean;
  setTrailerDialogOpen: (open: boolean) => void;
}

export const DialogTrailer = ({
  title,
  trailerUrl,
  trailerDialogOpen,
  setTrailerDialogOpen,
}: DialogTrailerProps) => {
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);

    return match ? match[1] : null;
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  return (
    <Dialog open={trailerDialogOpen} onOpenChange={setTrailerDialogOpen}>
      <DialogContent className="max-w-[1200px] w-[90vw] p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold">
            Trailer - {title}
          </DialogTitle>
          {/* <DialogClose asChild>
            <button className="p-2 rounded hover:bg-gray-800 transition">
              <X className="w-5 h-5" />
            </button>
          </DialogClose> */}
        </DialogHeader>
        <div
          className="relative w-full h-full"
          style={{ paddingTop: "50%" }} // giảm tỷ lệ để video cao hơn
        >
          {trailerUrl &&
            (isYouTubeUrl(trailerUrl) ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg bg-black"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                  background: "#000",
                }}
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(
                  trailerUrl
                )}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                className="absolute top-0 left-0 w-full h-full rounded-lg bg-black"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  background: "#000",
                }}
                controls
                autoPlay
              >
                <source src={trailerUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
