"use client";

import { useState, useEffect } from "react";
import { streamingControllerGetFileAccess } from "@/apis/api/streaming";

const HLS_MIME_TYPE = "application/x-mpegURL";

export interface VideoInfo {
  src: string;
  type: string;
  poster?: string;
}

interface AbsContentResult {
  fileUrl: string;
  accessQueryString?: string;
  cookies?: {
    [key: string]: {
      value: string;
      options?: object;
    };
  };
}

const useVideoAccess = (s3KeyStream: string) => {
  const [videoContent, setVideoContent] = useState<VideoInfo | undefined>(
    undefined,
  );

  const handleGetFileInfo = async () => {
    const cleanedS3Key = cleanFileUrl(s3KeyStream);
    console.log("Cleaned S3 Key:", cleanedS3Key);
    const s3FileKey = encodeURIComponent(cleanedS3Key);
    const mimeType = HLS_MIME_TYPE;

    try {
      const result = await streamingControllerGetFileAccess(
        { s3Key: s3FileKey },
        { withCredentials: true },
      );

      const data = result.data.data as AbsContentResult;
      setVideoContent({
        src: data.fileUrl,
        type: mimeType,
      });
    } catch (error) {
      console.error("Error fetching video access:", error);
    }
  };

  // Hàm xử lý cắt chuỗi
  function cleanFileUrl(url: string): string {
    const s3Prefix = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
    if (url.startsWith(s3Prefix)) {
      return url.replace(s3Prefix, "");
    }
    return url;
  }

  useEffect(() => {
    handleGetFileInfo();
  }, []);

  return { videoContent };
};

export default useVideoAccess;
