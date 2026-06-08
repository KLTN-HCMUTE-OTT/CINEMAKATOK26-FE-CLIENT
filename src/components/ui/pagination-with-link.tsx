"use client";

import { type ReactNode, useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PaginationWithLinksProps {
  pageSizeSelectOptions?: {
    pageSizeSearchParam?: string;
    pageSizeOptions: number[];
  };
  totalCount: number;
  pageSize: number;
  page: number;
  pageSearchParam?: string;
  paginationClassName?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  disabledLinkClassName?: string;
  pageSizeTriggerClassName?: string;
  pageSizeContentClassName?: string;
  //  Optional callbacks for client-side pagination (no URL navigation)
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Navigate with Nextjs links (need to update your own `pagination.tsx` to use Nextjs Link)
 * 
 * @example
 * ```
 * <PaginationWithLinks
    page={1}
    pageSize={20}
    totalCount={500}
  />
 * ```
 */
export function PaginationWithLinks({
  pageSizeSelectOptions,
  pageSize,
  totalCount,
  page,
  pageSearchParam,
  paginationClassName,
  linkClassName,
  activeLinkClassName,
  disabledLinkClassName,
  pageSizeTriggerClassName,
  pageSizeContentClassName,
  onPageChange,
  onPageSizeChange,
}: PaginationWithLinksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPageCount = Math.ceil(totalCount / pageSize);

  //  If callbacks provided, use client-side navigation; otherwise use URL
  const isClientSide = !!onPageChange;

  const buildLink = useCallback(
    (newPage: number) => {
      if (isClientSide) return "#"; // Client-side mode
      const key = pageSearchParam || "page";
      if (!searchParams) return `${pathname}?${key}=${newPage}`;
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(key, String(newPage));
      return `${pathname}?${newSearchParams.toString()}`;
    },
    [searchParams, pathname, pageSearchParam, isClientSide]
  );

  const handlePageClick = useCallback(
    (newPage: number) => (e: React.MouseEvent) => {
      if (isClientSide) {
        e.preventDefault();
        onPageChange?.(newPage);
      }
      // Otherwise, let the link navigate naturally
    },
    [isClientSide, onPageChange]
  );

  const navToPageSize = useCallback(
    (newPageSize: number) => {
      if (onPageSizeChange) {
        // Client-side callback
        onPageSizeChange(newPageSize);
      } else {
        // URL navigation
        const key = pageSizeSelectOptions?.pageSizeSearchParam || "pageSize";
        const newSearchParams = new URLSearchParams(searchParams || undefined);
        newSearchParams.set(key, String(newPageSize));
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }
    },
    [
      searchParams,
      pathname,
      router,
      pageSizeSelectOptions?.pageSizeSearchParam,
      onPageSizeChange,
    ]
  );

  const renderPageNumbers = () => {
    const items: ReactNode[] = [];
    const maxVisiblePages = 5;

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={buildLink(i)}
              onClick={handlePageClick(i)}
              isActive={page === i}
              className={cn(
                linkClassName,
                page === i ? activeLinkClassName : undefined
              )}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href={buildLink(1)}
            onClick={handlePageClick(1)}
            isActive={page === 1}
            className={cn(
              linkClassName,
              page === 1 ? activeLinkClassName : undefined
            )}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPageCount - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href={buildLink(i)}
              onClick={handlePageClick(i)}
              isActive={page === i}
              className={cn(
                linkClassName,
                page === i ? activeLinkClassName : undefined
              )}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPageCount}>
          <PaginationLink
            href={buildLink(totalPageCount)}
            onClick={handlePageClick(totalPageCount)}
            isActive={page === totalPageCount}
            className={cn(
              linkClassName,
              page === totalPageCount ? activeLinkClassName : undefined
            )}
          >
            {totalPageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full">
      {pageSizeSelectOptions && (
        <div className="flex flex-col gap-4 flex-1">
          <SelectRowsPerPage
            options={pageSizeSelectOptions.pageSizeOptions}
            setPageSize={navToPageSize}
            pageSize={pageSize}
            triggerClassName={pageSizeTriggerClassName}
            contentClassName={pageSizeContentClassName}
          />
        </div>
      )}
      <Pagination
        className={cn(
          { "md:justify-end": pageSizeSelectOptions },
          paginationClassName
        )}
      >
        <PaginationContent className="max-sm:gap-0">
          <PaginationItem>
            <PaginationPrevious
              href={buildLink(Math.max(page - 1, 1))}
              onClick={handlePageClick(Math.max(page - 1, 1))}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={cn(
                linkClassName,
                page === 1
                  ? disabledLinkClassName || "pointer-events-none opacity-50"
                  : undefined
              )}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              href={buildLink(Math.min(page + 1, totalPageCount))}
              onClick={handlePageClick(Math.min(page + 1, totalPageCount))}
              aria-disabled={page === totalPageCount}
              tabIndex={page === totalPageCount ? -1 : undefined}
              className={cn(
                linkClassName,
                page === totalPageCount
                  ? disabledLinkClassName || "pointer-events-none opacity-50"
                  : undefined
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function SelectRowsPerPage({
  options,
  setPageSize,
  pageSize,
  triggerClassName,
  contentClassName,
}: {
  options: number[];
  setPageSize: (newSize: number) => void;
  pageSize: number;
  triggerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="whitespace-nowrap text-sm text-gray-400">
        Rows per page
      </span>

      <Select
        value={String(pageSize)}
        onValueChange={(value) => setPageSize(Number(value))}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder="Select page size">
            {String(pageSize)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
