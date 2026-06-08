"use client";

import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { useFeaturedNews } from "@/hooks/use-news";
import Link from "next/link";

export function BlogBanner() {
  const { data, error, isLoading } = useFeaturedNews();

  if (isLoading) {
    return (
      <div className="w-full py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-[400px] w-full rounded-xl bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const news = data;
  const category = news.category || "MOVIES NEWS";
  const formattedDate = new Date(news.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${news.id}`}>
      <div className="w-full text-white pt-8 md:pt-12 pb-8 md:pb-16">
        <div className="md:px-3 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left side - Image */}
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg ">
              <Image
                src={news.cover_image || "/placeholder.jpg"}
                alt={news.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>

            {/* Right side - Content */}
            <div className="flex flex-col space-y-6">
              {/* Category Badge */}
              <div className="flex space-x-3">
                {category &&
                  category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-block bg-purple-600 text-white text-2xl md:text-xl font-semibold px-7 py-4 rounded-2xl"
                    >
                      {cat}
                    </span>
                  ))}
              </div>

              {/* Title - Extra large, compact spacing */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-[90px] font-bold leading-[1.05] tracking-tight text-white hover:text-purple-400 cursor-pointer">
                {news.title}
              </h1>

              {/* Summary - Better spacing and color */}
              <p className="text-gray-300 text-2xl md:text-2xl leading-relaxed max-w-2xl">
                {news.summary}
              </p>

              {/* Footer info — enlarged */}
              <div className="flex items-center gap-8 text-gray-300 text-base md:text-2xl pt-2">
                <span className="font-semibold">
                  {news.author_name || "Admin"}
                </span>
                <span className="font-semibold">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
