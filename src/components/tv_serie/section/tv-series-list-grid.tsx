/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Combobox } from "@/components/ui/combobox";

import { useTvSeriesData } from "@/hooks/use-tvseries";

import { id } from "date-fns/locale";
import { TvSeriesList } from "./tv-series-list";
import { PaginationWithLinks } from "@/components/ui/pagination-with-link";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  type?: string;
  categoryId?: string;
}

const TITLE_MAP: Record<string, string> = {
  all: "Tất cả phim",
  trending: "Phim đang thịnh hành",
  category: "Phim theo thể loại",
};

export default function TvSeriesListGrid({ type = "all", categoryId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showContent, setShowContent] = useState(true);
  const loadingStartTimeRef = useRef<number | null>(null);
  const isFirstLoadRef = useRef(true);
  const [selectedSortBy, setSelectedSortBy] = useState("viewCount");

  // Build search params based on filters
  const sortParams: Record<string, string> = {};
  if (selectedSortBy) {
    sortParams[selectedSortBy] = "DESC"; // Descending order
  }

  const {
    result: currentData,
    isLoading: isMovieLoading,
    error: isMovieError,
  } = useTvSeriesData({
    type,
    categoryId,
    page: currentPage,
    limit: pageSize,
    sort: selectedSortBy ? JSON.stringify(sortParams) : undefined,
  });

  const transformedTVs = useMemo(() => {
    if (!currentData?.data) return [];

    return currentData.data.map((tv) => ({
      id: tv.id,
      title: tv.metaData.title,
      imageUrl: tv.metaData.thumbnail || "/placeholder-tvseries.jpg",
      genres: tv.metaData.categories.map((ct) => ({
        categoryName: ct.categoryName,
        id: ct.id,
      })),
    }));
  }, [currentData]);

  useEffect(() => {
    if (isMovieLoading) {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        return;
      }
      setShowContent(false);
      loadingStartTimeRef.current = Date.now();
    } else if (loadingStartTimeRef.current !== null) {
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const minLoadingTime = 750;

      if (elapsed < minLoadingTime) {
        const remaining = minLoadingTime - elapsed;
        const timer = setTimeout(() => {
          setShowContent(true);
          loadingStartTimeRef.current = null;
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        setShowContent(true);
        loadingStartTimeRef.current = null;
      }
    }
  }, [isMovieLoading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSortBy]);

  const shouldShowLoading = isMovieLoading || !showContent;

  const sortByOptions = useMemo(
    () => [
      { value: "viewCount", label: "Most Viewed" },
      { value: "avgRating", label: "Highest Rated" },
      { value: "releaseDate", label: "Newest" },
    ],
    []
  );

  if (shouldShowLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute">
              <Spinner className="w-16 h-16 text-purple-400 opacity-25 animate-ping" />
            </div>
            <Spinner className="w-16 h-16 text-purple-300 drop-shadow-lg" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-purple-100">
              Loading movies...
            </p>
            <div className="flex items-center justify-center space-x-1">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-purple-200 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meta = currentData!.meta;
  return (
    <div className="my-8 transition-opacity duration-500 opacity-100 animate-fadeIn">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {TITLE_MAP[type] || "Phim"}
          </h2>
          <p className="text-gray-400">
            Show {(meta.currentPage - 1) * meta.itemsPerPage + 1}–
            {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)} of{" "}
            {meta.totalItems} results
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <Combobox
            value={selectedSortBy}
            onChange={setSelectedSortBy}
            options={sortByOptions}
            placeholder="Sort By"
          />
        </div>
      </div>

      {/* Movie Grid */}
      {/* Main Content */}
      {isMovieError ? (
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Loading Error</AlertTitle>
          <AlertDescription>{isMovieError}</AlertDescription>
        </Alert>
      ) : !currentData || currentData.data.length === 0 ? (
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Not found TV series.</AlertDescription>
        </Alert>
      ) : (
        <>
          <TvSeriesList tvSeries={transformedTVs} />
          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}
