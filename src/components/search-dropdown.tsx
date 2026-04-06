"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Play, X } from "lucide-react";
import Image from "next/image";
import { movieControllerFindAll } from "@/apis/api/movie";
import { tvSeriesControllerFindAll } from "@/apis/api/tvSeries";

interface SearchResult {
  id: string;
  title: string;
  poster?: string;
  description?: string;
  year?: number;
  duration?: number;
  totalSeasons?: number;
  type: "movie" | "tv";
}

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchDropdown({
  isOpen,
  onClose,
  query,
  onQueryChange,
}: SearchDropdownProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  // Pagination state for lazy loading
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      console.error("Failed to load recent searches");
    }
  }, []);

  // Debounced search function - MUST be before effects that use it
  const performSearch = useCallback(
    async (searchQuery: string, pageNum: number = 1) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const isLoadMore = pageNum > 1;
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setPage(1);
      }

      try {
        // Create search query object with title
        const searchQueryObj = JSON.stringify({ title: searchQuery });

        // Search movies
        const movieResponse = await movieControllerFindAll(
          {
            search: searchQueryObj,
            limit: 5,
            page: pageNum,
          },
          { withCredentials: true }
        );

        // Search TV series
        const tvResponse = await tvSeriesControllerFindAll(
          {
            search: searchQueryObj,
            limit: 5,
            page: pageNum,
          },
          { withCredentials: true }
        );

        const movieResults: SearchResult[] = (
          movieResponse.data.data || []
        ).map((movie: any) => ({
          id: movie.id,
          title: movie.metaData.title,
          poster: movie.metaData.banner,
          description: movie.metaData.description,
          year: movie.metaData.releaseDate
            ? new Date(movie.metaData.releaseDate).getFullYear()
            : undefined,
          duration: movie.duration,
          type: "movie" as const,
        }));
        const tvResults: SearchResult[] = (tvResponse.data.data || []).map(
          (tv: API.TVSeriesSummaryDto) => ({
            id: tv.id,
            title: tv.metaData.title,
            poster: tv.metaData.banner,
            description: tv.metaData.description,
            totalSeasons: tv.totalSeasons,
            type: "tv" as const,
          })
        );

        const combined = [...movieResults, ...tvResults];

        if (isLoadMore) {
          setResults((prev) => [...prev, ...combined]);
        } else {
          setResults(combined.slice(0, 5));
        }

        // Check if there's more data to load
        const hasMovies = movieResults.length > 0;
        const hasTv = tvResults.length > 0;
        setHasMore(hasMovies || hasTv);
        setPage(pageNum);
      } catch (error) {
        console.error("Search error:", error);
        if (!isLoadMore) {
          setResults([]);
        }
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside (except search form)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Find search form in header (the relative container)
      const searchForm = document.querySelector("[data-search-form]");

      // Don't close if clicking on search form or dropdown
      if (searchForm && searchForm.contains(e.target as Node)) {
        return;
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Watch for query changes from header input
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, 1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Infinite scroll - lazy load more results when scrolling down
  useEffect(() => {
    if (!scrollContainerRef.current || !lastElementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingMore &&
          query.trim()
        ) {
          // Load next page
          performSearch(query, page + 1);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(lastElementRef.current);

    return () => {
      if (lastElementRef.current) {
        observer.unobserve(lastElementRef.current);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, query, page, performSearch]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    const newRecent = [
      result.title,
      ...recentSearches.filter((r) => r !== result.title),
    ].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));

    // Navigate
    if (result.type === "movie") {
      router.push(`/movies/${result.id}`);
    } else {
      router.push(`/tv_series/${result.id}`);
    }

    onClose();
    onQueryChange("");
  };

  // Handle recent search click
  const handleRecentClick = (searchTerm: string) => {
    onQueryChange(searchTerm);
    performSearch(searchTerm);
  };

  // Handle remove recent search
  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter((r) => r !== term);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Below header, doesn't cover it - Click to close */}
      <div
        className="fixed top-16 left-0 right-0 bottom-0 bg-black/60 z-30"
        onClick={(e) => {
          // Only close if clicking directly on backdrop, not on dropdown
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      />

      {/* Dropdown Container - Absolute positioning relative to header */}
      <div
        ref={containerRef}
        className="absolute top-full left-0 right-0 mt-2 z-40 px-4 sm:px-0 flex justify-center"
      >
        <div className="w-full sm:w-96 md:w-[480px] bg-gray-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[440px]">
          {/* Results Section - Scrollable with custom scrollbar */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto search-scrollbar"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 text-sm">Searching...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="p-4 space-y-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}-${index}`}
                    ref={index === results.length - 1 ? lastElementRef : null}
                    onClick={() => handleResultClick(result)}
                    className="flex gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 group"
                  >
                    {/* Poster */}
                    <div className="w-14 h-20 flex-shrink-0 rounded overflow-hidden relative bg-gray-800">
                      {result.poster ? (
                        <Image
                          src={result.poster || "/default_banner.jpg"}
                          alt={result.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="56px"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = "/default_banner.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                          <Play className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {result.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        {result.type === "movie" ? (
                          <>
                            {result.year && (
                              <>
                                <span>{result.year}</span>
                                <span>•</span>
                              </>
                            )}
                            {result.duration && (
                              <span>{result.duration} min</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span>{result.totalSeasons} Seasons</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Loading indicator for lazy load */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  </div>
                )}{" "}
              </div>
            ) : query.trim() ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-400 text-sm">No results found</p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="p-4">
                <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-3 px-2 font-semibold">
                  Recent
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentClick(term)}
                      className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Clock className="w-4 h-4 text-gray-600 flex-shrink-0 group-hover:text-purple-400 transition-colors" />
                        <span className="text-gray-300 text-sm group-hover:text-white transition-colors truncate">
                          {term}
                        </span>
                      </div>
                      <div
                        onClick={(e) => handleRemoveRecent(e, term)}
                        className="flex-shrink-0 p-1 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Search className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-gray-400 text-xs">Start typing to search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
