import { RouteLoadingFallback } from "@/components/route-fallbacks";

export default function Loading() {
  return <RouteLoadingFallback title="Loading Home" cards={8} hero />;
}
