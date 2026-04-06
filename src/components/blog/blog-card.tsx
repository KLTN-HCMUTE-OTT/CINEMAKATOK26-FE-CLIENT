/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { useNews } from "@/hooks/use-news";
import { PaginationWithLinks } from "../ui/pagination-with-link";
import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { SearchIcon } from "lucide-react";

interface BlogCardProps {
  news: API.NewsDto;
}

export function BlogCard({ news }: BlogCardProps) {
  const formattedDate = new Date(news.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/blog/${news.id}`}>
      <div className="group flex flex-col md:flex-row gap-6 bg-slate-900/80 rounded-lg overflow-hidden hover:bg-slate-800/80 transition-all duration-300">
        {/* Image */}
        <div className="relative w-full md:w-[20vw] h-[30vh] md:h-[30vh] flex-shrink-0 overflow-hidden">
          <Image
            src={news.cover_image || "/placeholder.jpg"}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-6 md:p-8 flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors line-clamp-2">
            {news.title}
          </h3>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 line-clamp-3">
            {news.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm md:text-base">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{news.name || "Anonymous"}</span>
            <span>•</span>
            {news.category && <span>{news.category.join(", ")}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Blog Card List component
export function BlogCardList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [previousData, setPreviousData] = useState<API.NewsDto[] | null>(null);

  const { data, isLoading, error } = useNews({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  });

  // Update previous data when new data arrives
  useEffect(() => {
    if (data?.data && !isLoading) {
      setPreviousData(data.data);
    }
  }, [data, isLoading]);

  // Debounce search input
  useEffect(() => {
    setIsSearching(true);
    const delay = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(delay);
      setIsSearching(false);
    };
  }, [searchInput]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const newsList = data?.data || previousData || [];
  const meta = data?.meta || { totalItems: 0, currentPage: 1, totalPages: 1 };
  const showLoading = (isLoading || isSearching) && !previousData;

  // Initial loading with skeleton
  if (showLoading) {
    return (
      <div className="w-full overflow-hidden mx-auto space-y-8 md:px-3 lg:px-16 pb-8">
        <InputGroup className="h-14 rounded-xl overflow-hidden w-[20vw]">
          <InputGroupInput
            placeholder="Search news..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="text-white border-white/10 text-lg h-14 px-5 placeholder:text-gray-400"
          />

          <InputGroupAddon className="px-4">
            <SearchIcon className="text-gray-400 w-6 h-6" />
          </InputGroupAddon>

          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={handleSearch}
              className="h-14 px-6 text-lg font-semibold rounded-none"
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-6 bg-slate-900/80 rounded-lg overflow-hidden animate-pulse"
            >
              <Skeleton className="w-full md:w-[20vw] h-[30vh]" />
              <div className="flex flex-col justify-center p-6 md:p-8 flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-12">
        Error loading news. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden mx-auto space-y-8 md:px-3 lg:px-16 pb-8">
      {/* Search Bar */}
      <InputGroup className="h-14 rounded-xl overflow-hidden w-[20vw]">
        <InputGroupInput
          placeholder="Search news..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="text-white border-white/10 text-lg h-14 px-5 placeholder:text-gray-400"
        />

        <InputGroupAddon className="px-4">
          <SearchIcon className="text-gray-400 w-6 h-6" />
        </InputGroupAddon>

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={handleSearch}
            className="h-14 px-6 text-lg font-semibold rounded-none"
          >
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* News List with Loading Overlay */}
      <div className="relative">
        {/* Loading overlay when paginating */}
        {(isLoading || isSearching) && previousData && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-3 bg-slate-900/90 px-6 py-3 rounded-full">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              <span className="text-white font-medium">Loading...</span>
            </div>
          </div>
        )}

        {newsList.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "No news available."}
          </div>
        ) : (
          <div className="space-y-6">
            {newsList.map((news) => (
              <div key={news.id} className="pb-2">
                <BlogCard news={news} />
              </div>
            ))}

            {/* Pagination */}
            {meta.totalItems > pageSize && (
              <div className="mt-8">
                <PaginationWithLinks
                  page={currentPage}
                  pageSize={pageSize}
                  totalCount={meta.totalItems}
                  pageSizeSelectOptions={{ pageSizeOptions: [5, 10, 25, 50] }}
                  onPageChange={(newPage) => setCurrentPage(newPage)}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  paginationClassName="justify-center md:justify-end"
                  linkClassName="bg-[#1a1f3a] text-sm text-gray-200 border border-white/10 hover:bg-purple-600 hover:text-white transition-colors"
                  activeLinkClassName="bg-purple-600 text-white border-purple-400"
                  disabledLinkClassName="pointer-events-none opacity-40"
                  pageSizeTriggerClassName="bg-[#1a1f3a] text-gray-200 border border-white/10 hover:bg-purple-600 hover:text-white transition-colors"
                  pageSizeContentClassName="bg-[#0f172a] text-gray-200 border border-white/10"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
