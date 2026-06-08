"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { RankList } from "@/components/rank-list";
import { useCategories } from "@/hooks/use-categories";
interface AppSidebarProps {
  type?: string;
}
export function AppSidebar({ type = "movies" }: AppSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { categories, isLoading, error } = useCategories();
  const genres = categories.map((category) => ({
    name: category.categoryName,
    id: category.id,
  }));

  const renderBreadcrumbs = () => {
    if (!pathname) return null;

    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("type");
    const crumbs = idx >= 0 ? parts.slice(idx + 1) : parts.slice(1);

    return crumbs.map((crumb, i) => {
      let label = crumb;

      // Xử lý route đặc biệt
      if (crumb === "new-release") label = "New Release";
      else if (crumb === "trending") label = "Trending";
      else if (crumb === "all") label = "All Movies";
      else if (crumb.startsWith("category")) label = "Category";
      else if (crumb.includes("-")) {
        const namePart = crumb.split("-")[0];
        label = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      return (
        <span key={i} className="flex items-center">
          <span className="mx-1">/</span>
          <span>{label}</span>
        </span>
      );
    });
  };
  return (
    <SidebarProvider>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden bg-purple-600 text-white p-3 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-[85vw] max-w-sm bg-slate-900
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:inset-auto lg:w-full lg:max-w-none lg:bg-transparent
          lg:translate-x-0
          flex flex-col
        `}
      >
        <aside className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent lg:overflow-visible lg:h-auto lg:sticky lg:top-24 w-full text-white">
          {/* Header */}
          <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-800 flex-shrink-0">
            <h1 className="text-2xl lg:text-4xl font-bold mb-1">Movies</h1>
            <div className="text-sm lg:text-xl text-gray-400 flex items-center gap-1 flex-wrap">
              <Link href="/" className="hover:text-white font-medium">
                Home
              </Link>
              {renderBreadcrumbs()}
            </div>
          </div>

          {/* Genres Section */}
          <div className="px-4 lg:px-6 py-4 lg:py-6 border-b border-gray-800 flex-shrink-0">
            <h2 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">
              Genres
            </h2>
            {isLoading ? (
              <div className="text-gray-400 text-sm">Loading genres...</div>
            ) : error ? (
              <div className="text-red-400 text-sm">Failed to load genres</div>
            ) : (
              <SidebarMenuSub className="space-y-1.5 lg:space-y-2 border-l-0 ml-0 pl-0">
                {genres.map((genre) => {
                  const slug = genre.name.toLowerCase().replace(/\s+/g, "-");
                  const url = `/${type}/type/category/${slug}-${genre.id}`;
                  const isActive = pathname === url;
                  return (
                    <SidebarMenuSubItem key={genre.id}>
                      <SidebarMenuSubButton
                        asChild
                        className={`
                      text-base lg:text-xl font-semibold py-1.5 lg:py-2 transition-colors
                      ${
                        isActive
                          ? "text-purple-400" // CSS nếu đang active
                          : "text-gray-300 hover:text-white" // CSS mặc định
                      }
                    `}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={url}>{genre.name}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            )}
          </div>

          <div className="py-6">
            <div className="w-full overflow-hidden">
              <RankList
                title="Top 10 Movies"
                showFilterTabs={false}
                type={type}
              />
            </div>
          </div>
        </aside>
      </div>
    </SidebarProvider>
  );
}
