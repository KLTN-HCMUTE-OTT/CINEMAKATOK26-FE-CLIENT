import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return (
    <RouteLoadingFallback title="Đang tải phim theo danh mục" cards={12} />
  );
}
