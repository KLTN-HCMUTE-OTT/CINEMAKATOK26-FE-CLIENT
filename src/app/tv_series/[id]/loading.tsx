import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return <RouteLoadingFallback title="Loading TV Series" cards={6} hero />;
}
