"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { SkeletonCard } from "@/components/skeleton-card";

export function RouteLoadingFallback({
  title,
  cards = 6,
  hero = false,
}: {
  title: string;
  cards?: number;
  hero?: boolean;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="space-y-4">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="h-10 w-72 rounded-2xl bg-white/10" />
          <div className="h-4 w-96 max-w-full rounded-full bg-white/10" />
        </div>

        {hero && <div className="h-[42vh] rounded-3xl bg-white/10" />}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <SkeletonCard key={`${title}-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RouteErrorFallback({
  error,
  reset,
  title = "Đã có lỗi xảy ra",
}: {
  error: Error;
  reset: () => void;
  title?: string;
}) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black px-4 py-16 text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          Không thể tải nội dung lúc này. Vui lòng thử lại hoặc quay về trang
          chủ.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Về trang chủ
          </Link>
        </div>

        {isDevelopment && (
          <pre className="mt-8 w-full overflow-auto rounded-2xl bg-black/60 p-4 text-left text-xs text-red-200">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
        )}
      </div>
    </div>
  );
}
