import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return (
    <RouteLoadingFallback title="Đang tải TV Series theo danh mục" cards={12} />
  );
}
