"use client";

import { useQuery } from "@tanstack/react-query";
import {
  streamingControllerGetFileAccess,
  streamingControllerGetManifestUrl,
  streamingControllerGetDrmKeyInfo,
} from "@/apis/api/streaming";
import { queryKeys } from "@/lib/query-keys";

const HLS_MIME_TYPE = "application/x-mpegURL";
const DASH_MIME_TYPE = "application/dash+xml";

export interface VideoInfo {
  src: string;
  type: string;
  poster?: string;
  drmKeyId?: string | null;
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

function cleanFileUrl(url: string): string {
  const s3Prefix = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
  if (url.startsWith(s3Prefix)) {
    return url.replace(s3Prefix, "");
  }
  return url;
}

export interface UseVideoAccessProps {
  s3KeyStream?: string;
  videoId?: string;
}

const useVideoAccess = (arg: string | UseVideoAccessProps) => {
  let s3KeyStream = "";
  let videoId = "";

  if (typeof arg === "string") {
    s3KeyStream = arg;
  } else if (arg) {
    s3KeyStream = arg.s3KeyStream || "";
    videoId = arg.videoId || "";
  }

  const cleanedS3Key = s3KeyStream ? cleanFileUrl(s3KeyStream) : "";
  const s3FileKey = cleanedS3Key ? encodeURIComponent(cleanedS3Key) : "";

  const { data: videoContent, isLoading, error } = useQuery({
    queryKey: videoId
      ? ["videoAccess", "drm", videoId]
      : ["videoAccess", "public", s3FileKey],
    queryFn: async () => {
      if (videoId) {
        // Step 1: Get signed manifest URL and trigger cookie setting via API Gateway
        const manifestResult = await streamingControllerGetManifestUrl(
          { videoId },
          { withCredentials: true }
        );
        const manifestUrl = manifestResult.data?.data?.manifestUrl;
        if (!manifestUrl) {
          throw new Error("Failed to get manifest URL");
        }

        // Step 2: Get DRM key ID for Clearkey decryption configuration
        let drmKeyId: string | null = null;
        try {
          const drmResult = await streamingControllerGetDrmKeyInfo(
            { videoId },
            { withCredentials: true }
          );
          drmKeyId = drmResult.data?.data?.keyId || null;
        } catch (drmErr) {
          console.warn("No DRM key found or failed to fetch DRM key info", drmErr);
        }

        return {
          src: manifestUrl,
          type: DASH_MIME_TYPE,
          drmKeyId,
        } as VideoInfo;
      } else if (s3FileKey) {
        const result = await streamingControllerGetFileAccess(
          { s3Key: s3FileKey },
          { withCredentials: true }
        );

        const data = result.data.data as AbsContentResult;
        return {
          src: data.fileUrl,
          type: HLS_MIME_TYPE,
          drmKeyId: null,
        } as VideoInfo;
      }
      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!videoId || !!s3KeyStream,
  });

  return { videoContent, isLoading, error };
};

export default useVideoAccess;
