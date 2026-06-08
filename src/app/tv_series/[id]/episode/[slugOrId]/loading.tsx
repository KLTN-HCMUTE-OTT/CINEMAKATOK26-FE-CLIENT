import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return <RouteLoadingFallback title="Đang tải tập phim" cards={4} hero />;
}
