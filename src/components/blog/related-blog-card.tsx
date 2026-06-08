"use client";

import Image from "next/image";
import Link from "next/link";
import { useRelatedNews } from "@/hooks/use-news";
import { Skeleton } from "../ui/skeleton";
import { CustomCarousel } from "../custom-carousel";

interface RelatedBlogCardProps {
  news: API.NewsDto;
}

export function RelatedBlogCard({ news }: RelatedBlogCardProps) {
  const formattedDate = new Date(news.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${news.id}`}>
      <div className="group relative overflow-hidden rounded-lg">
        {/* Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={news.cover_image || "/placeholder.jpg"}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {news.title}
          </h3>

          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {news.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
            <span>{news.author_name || "Admin"}</span>
            <span>•</span>
            {news.category && (
              <>
                <span>{news.category.join(", ")}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface RelatedBlogCardListProps {
  newsId: string;
  limit?: number;
}

export function RelatedBlogCardList({
  newsId,
  limit = 6,
}: RelatedBlogCardListProps) {
  const { data, isLoading, error } = useRelatedNews(newsId, { page: 1, limit });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg animate-pulse"
          >
            <Skeleton className="aspect-[16/9] w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-12">
        Error loading related news.
      </div>
    );
  }

  const relatedNews = data?.data || [];

  if (relatedNews.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No related news available.
      </div>
    );
  }

  return (
    <section className="px-6 py-8 overflow-hidden">
      <CustomCarousel
        items={relatedNews}
        slidesToShow={5}
        renderCard={(item: API.NewsDto) => (
          <RelatedBlogCard key={item.id} news={item} />
        )}
        title="Related News"
        showViewAll={false}
      />
    </section>
  );
}
