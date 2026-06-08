"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RelatedBlogCardList } from "@/components/blog/related-blog-card";
import { useNewsById } from "@/hooks/use-news";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error } = useNewsById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <Header variant="fixed" />
        <div className="mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="bg-slate-900/80 rounded-lg overflow-hidden">
            <Skeleton className="aspect-[21/9] w-full" />
            <div className="p-8 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-red-600">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-red-400 py-12">
            Error loading news. Please try again later.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const news = data;
  const formattedDate = new Date(news.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="fixed" />

      <div className="pt-16 px-8">
        {/* Article Container */}
        <article className=" rounded-lg overflow-hidden">
          {/* Featured Image */}
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={news.cover_image || "/placeholder.jpg"}
              alt={news.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-6">
            {/* Category Badge */}
            {news.category && (
              <div className="flex space-x-3">
                {news.category.map((cat, index) => (
                  <span
                    key={index}
                    className="inline-block px-4 py-2 bg-purple-600 text-white text-xl font-semibold rounded-lg uppercase"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              {news.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 border-b border-gray-700 pb-6">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{news.author_name || "Anonymous"}</span>
              </div>
            </div>

            {/* Content */}
            <div
              className="
    prose prose-invert prose-lg max-w-none
    prose-headings:mt-8 prose-headings:mb-4 prose-headings:font-bold
    prose-p:mb-2 text-white text-2xl leading-relaxed font-serif
    prose-a:text-purple-400 prose-a:no-underline prose-a:hover:text-purple-300 prose-a:transition-colors
    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
    prose-code:bg-purple-900/30 prose-code:text-purple-300 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
    prose-pre:bg-gray-800 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto
    prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8
    prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-gray-500 prose-figcaption:mt-2
    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:space-y-2
    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:space-y-2
    prose-li:text-gray-300
    prose-strong:text-white prose-strong:font-semibold
    prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
    [&_img]:max-w-2xl [&_img]:mx-auto [&_img]:w-full"
              dangerouslySetInnerHTML={{
                __html: news.content_html || "<p>No content</p>",
              }}
            />
            {/* Author Info */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <div className="bg-gradient-to-r  rounded-lg p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-white/20">
                    <Image
                      src={
                        typeof news.author_avatar === "string"
                          ? news.author_avatar
                          : news.author_avatar?.src ?? "/default-avatar.jpg"
                      }
                      alt={news.author_name || "Author"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm text-purple-200 font-semibold uppercase tracking-wider">
                        Author
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {news.author_name || "Anonymous"}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related News */}
        <div className="mt-16">
          <RelatedBlogCardList newsId={id} limit={6} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
