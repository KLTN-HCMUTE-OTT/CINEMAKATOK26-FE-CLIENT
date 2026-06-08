"use client";

import { useNews } from "@/hooks/use-news";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { CustomCarousel } from "./custom-carousel";

export function TopNews() {
  const { data, error, isLoading } = useNews({ page: 1, limit: 6 });
  const newsArticles = data?.data || [];

  if (isLoading) {
    return (
      <section className="px-6 py-8">
        <h2 className="text-white text-2xl font-bold mb-6">Top News</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="w-full h-48 rounded-lg mb-4" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 py-8">
        <h2 className="text-white text-2xl font-bold mb-6">Top News</h2>
        <p className="text-red-500">Failed to load top news.</p>
      </section>
    );
  }

  return (
    <section className="px-6 py-8">
      <CustomCarousel
        items={newsArticles}
        slidesToShow={3}
        renderCard={(article: API.NewsDto) => (
          <Link
            key={article.id}
            href={`/blog/${article.id}`}
            className="group cursor-pointer block px-3"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
              <Image
                src={article.cover_image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">
                {article.title}
              </h3>

              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span>
                  {new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
                <span>{article.author_name}</span>
                {article.category && (
                  <>
                    <span>•</span>
                    <span>{article.category.join(", ")}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        )}
        title="Top News"
        showViewAll={true}
        urlNavigate="/blog"
      />
    </section>
  );
}
