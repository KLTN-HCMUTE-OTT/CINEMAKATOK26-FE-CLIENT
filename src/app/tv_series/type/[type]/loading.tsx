import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return (
    <RouteLoadingFallback title="Đang tải TV Series theo loại" cards={12} />
  );
}
