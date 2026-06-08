import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return <RouteLoadingFallback title="Đang tải danh sách phim" cards={12} />;
}
