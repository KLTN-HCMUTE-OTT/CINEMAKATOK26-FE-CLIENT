"use client";
import { ActionsProvider } from "@/contexts/movie-actions-context";
import TVSeriesVideoContent from "@/components/tv_serie/tv-series-content";
import { useTvSeriesDetail } from "@/hooks/use-tvseries";
import { Loader2 } from "lucide-react";
import { useMemo, use } from "react";

// export const metadata = {
//   title: "TV Series | My App",
//   description: "Browse the TV series",
// };

interface Props {
  params: Promise<{
    id: string;
    slugOrId: string;
  }>;
}

// Main component with Provider
export default function TVSeriesVideoPage({ params }: Props) {
  // --- A. PHÂN TÍCH PARAMS ĐƯỜNG DẪN ---

  // Lấy series slug và episode slug
  const { id: tvSeriesSlug, slugOrId: episodeSlugOrId } = use(params);
  // Logic trích xuất Series UUID (giống như bạn đã làm, nhưng áp dụng cho params.id)
  const tvSeriesId = useMemo(() => {
    if (tvSeriesSlug.includes("-")) {
      const parts = tvSeriesSlug.split("-");
      // Lấy 5 phần cuối (giả định đây là UUID)
      const possibleUUID = parts.slice(-5).join("-");

      if (
        possibleUUID.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        )
      ) {
        return possibleUUID;
      }
    }
    // Nếu không khớp UUID, có thể dùng toàn bộ slug để gọi API
    return tvSeriesSlug;
  }, [tvSeriesSlug]);

  // trich xuất episodeId từ params.slugOrId
  const episodeId = useMemo(() => {
    if (episodeSlugOrId.includes("-")) {
      const parts = episodeSlugOrId.split("-");
      const possibleUUID = parts.slice(-5).join("-");
      if (
        possibleUUID.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        )
      ) {
        return possibleUUID;
      }
    }
    return episodeSlugOrId;
  }, [episodeSlugOrId]);

  const { result, isLoading, error } = useTvSeriesDetail(tvSeriesId);
  const resolvedContentId = result?.metaData?.id || result?.id || "";

  // Keep spinner only while detail request is in-flight
  if (isLoading && !resolvedContentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center px-4 text-center text-red-300">
        Can not load TV Series data. Please try again later.
      </div>
    );
  }

  if (!tvSeriesId || !result || !resolvedContentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center px-4 text-center text-gray-200">
        TV Series not found. Please check the URL or try again later.
      </div>
    );
  }

  return (
    <ActionsProvider contentId={resolvedContentId}>
      <TVSeriesVideoContent tvSeries={result} episodeId={episodeId} />
    </ActionsProvider>
  );
}
