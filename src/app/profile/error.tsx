"use client";

import { RouteErrorFallback } from "@/components/route-fallbacks";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorFallback error={error} reset={reset} title="Profile Error" />
  );
}
