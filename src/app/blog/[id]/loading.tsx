import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return <RouteLoadingFallback title="Loading Post" cards={4} hero />;
}
