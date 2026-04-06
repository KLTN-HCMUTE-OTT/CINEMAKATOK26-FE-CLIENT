/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Combobox } from "./ui/combobox";
import { PaginationWithLinks } from "./ui/pagination-with-link";
import { MovieHoverCardList } from "./movie-hover-card";
import { useCategories } from "@/hooks/use-categories";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { useMovieData } from "@/hooks/use-movies";

interface Props {
  type?: string;
  categoryId?: string;
}

const TITLE_MAP: Record<string, string> = {
  all: "Tất cả phim",
  trending: "Phim đang thịnh hành",
  "new-release": "Phim mới phát hành",
  category: "Phim theo thể loại",
};

export default function MovieListGrid({ type = "all", categoryId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showContent, setShowContent] = useState(true);
  const loadingStartTimeRef = useRef<number | null>(null);
  const isFirstLoadRef = useRef(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("viewCount");

  //  Build search params based on filters
  const searchParams = useMemo(() => {
    const params: Record<string, string> = {};

    if (selectedYear) {
      params.releaseDate = selectedYear;
    }

    // Có thể thêm các filter khác ở đây
    // if (selectedCategory) {
    //   params.category = selectedCategory;
    // }

    return Object.keys(params).length > 0 ? params : undefined;
  }, [selectedYear]);

  const sortParams: Record<string, string> = {};
  if (selectedSortBy) {
    sortParams[selectedSortBy] = "DESC"; // Descending order
  }

  const {
    result: currentData,
    isLoading: isMovieLoading,
    error: isMovieError,
  } = useMovieData({
    type,
    categoryId,
    page: currentPage,
    limit: pageSize,
    search: searchParams ? JSON.stringify(searchParams) : undefined,
    sort: selectedSortBy ? JSON.stringify(sortParams) : undefined,
  });

  const transformedMovies = useMemo(() => {
    if (!currentData?.data) return [];

    return currentData.data.map((movie) => ({
      id: movie.id.toString(),
      poster: movie.metaData.thumbnail || "/placeholder.jpg",
      backdrop: movie.metaData.banner || "/placeholder.jpg",
      title: movie.metaData.title,
      year: new Date(movie.metaData.releaseDate).getFullYear(),
      genres: movie.metaData.categories?.map((g) => g.categoryName) || [],
      rating: 0,
      duration: `${movie.duration} phút`,
      description: movie.metaData.description,
      actors: movie.metaData.actors.map((c) => c.name) || [],
      crew: movie.metaData.directors?.map((c) => c.name) || [],
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
  }, [selectedYear, selectedSortBy]);

  const shouldShowLoading = isMovieLoading || !showContent;

  const optionsYear = useMemo(
    () =>
      [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((year) => ({
        value: year.toString(),
        label: year.toString(),
      })),
    []
  );

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
            value={selectedYear}
            onChange={setSelectedYear}
            options={optionsYear}
            placeholder="Year"
          />
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
          <AlertDescription>Not found movies.</AlertDescription>
        </Alert>
      ) : (
        <>
          <MovieHoverCardList movies={transformedMovies} />

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
