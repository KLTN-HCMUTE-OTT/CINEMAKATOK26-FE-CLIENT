"use client";

import { useQuery } from "@tanstack/react-query";
import { streamingControllerGetFileAccess } from "@/apis/api/streaming";
import { queryKeys } from "@/lib/query-keys";

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

function cleanFileUrl(url: string): string {
  const s3Prefix = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
  if (url.startsWith(s3Prefix)) {
    return url.replace(s3Prefix, "");
  }
  return url;
}

const useVideoAccess = (s3KeyStream: string) => {
  const cleanedS3Key = cleanFileUrl(s3KeyStream);
  const s3FileKey = encodeURIComponent(cleanedS3Key);

  const { data: videoContent } = useQuery({
    queryKey: queryKeys.videoAccess.access(s3FileKey),
    queryFn: async () => {
      const result = await streamingControllerGetFileAccess(
        { s3Key: s3FileKey },
        { withCredentials: true },
      );

      const data = result.data.data as AbsContentResult;
      return {
        src: data.fileUrl,
        type: HLS_MIME_TYPE,
      } as VideoInfo;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!s3KeyStream,
  });

  return { videoContent };
};

export default useVideoAccess;
