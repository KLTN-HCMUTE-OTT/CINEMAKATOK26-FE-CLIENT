"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MegaMenu } from "./mega-menu";
// import component bạn viết ở trên

export default function NavMenu() {
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const [openSubSection, setOpenSubSection] = React.useState<string | null>(
    null
  );

  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
      setOpenSubSection(null);
    } else {
      setOpenSection(section);
      setOpenSubSection(null);
    }
  };

  const toggleSubSection = (subSection: string) => {
    setOpenSubSection(openSubSection === subSection ? null : subSection);
  };

  return (
    <nav className="xl:flex items-center relative" style={{ zIndex: 9999 }}>
      {/* Mobile/Tablet Menu - Vertical List with Collapsible Sections */}
      <div className="xl:hidden flex flex-col w-full">
        {/* Home */}
        <div className="border-b border-gray-800">
          <button
            onClick={() => toggleSection("home")}
            className="w-full flex items-center justify-between px-4 py-3 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <span>Home</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSection === "home" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSection === "home" && (
            <div className="pb-2">
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Home
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="border-b border-gray-800">
          <button
            onClick={() => toggleSection("features")}
            className="w-full flex items-center justify-between px-4 py-3 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <span>Features</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSection === "features" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSection === "features" && (
            <div className="pb-4 px-4 bg-slate-800/50">
              {/* POPULAR */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSubSection("popular")}
                  className="w-full flex items-center justify-between py-2 text-white text-sm font-semibold uppercase tracking-wide"
                >
                  <span>POPULAR</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      openSubSection === "popular" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSubSection === "popular" && (
                  <div className="mt-2 space-y-2">
                    <Link
                      href="/movies/type/all"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      All Movies
                    </Link>
                    <Link
                      href="/movies/type/trending"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Trending Now
                    </Link>
                    <Link
                      href="/movies/type/new-release"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      New Releases
                    </Link>
                    <Link
                      href="/movies/type/recommend"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Recommend
                    </Link>
                  </div>
                )}
              </div>

              {/* GENRES */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSubSection("genres")}
                  className="w-full flex items-center justify-between py-2 text-white text-sm font-semibold uppercase tracking-wide"
                >
                  <span>GENRES</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      openSubSection === "genres" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSubSection === "genres" && (
                  <div className="mt-2 space-y-2">
                    <Link
                      href="/movies/type/category/action"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Action
                    </Link>
                    <Link
                      href="/movies/type/category/comedy"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Comedy
                    </Link>
                    <Link
                      href="/movies/type/category/drama"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Drama
                    </Link>
                    <Link
                      href="/movies/type/category/horror"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Horror
                    </Link>
                    <Link
                      href="/movies/type/category/sci-fi"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Sci-Fi
                    </Link>
                  </div>
                )}
              </div>

              {/* COLLECTIONS */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSubSection("collections")}
                  className="w-full flex items-center justify-between py-2 text-white text-sm font-semibold uppercase tracking-wide"
                >
                  <span>COLLECTIONS</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      openSubSection === "collections" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openSubSection === "collections" && (
                  <div className="mt-2 space-y-2">
                    <Link
                      href="#"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Actor's Spotlight
                    </Link>
                    <Link
                      href="#"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Holiday Movies
                    </Link>
                    <Link
                      href="#"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      New Trailers
                    </Link>
                    <Link
                      href="#"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Weekly Watchlist
                    </Link>
                    <Link
                      href="#"
                      className="block py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      TV Networks
                    </Link>
                  </div>
                )}
              </div>

              {/* MOVIES OF THE DAY */}
              <div>
                <div className="py-2 text-white text-sm font-semibold uppercase tracking-wide">
                  MOVIES OF THE DAY
                </div>
                <div className="mt-2">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src="/john-wick-4-movie-poster.jpg"
                      alt="John Wick 4"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg";
                      }}
                    />
                    <button className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                    <button className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pages */}
        <div className="border-b border-gray-800">
          <button
            onClick={() => toggleSection("pages")}
            className="w-full flex items-center justify-between px-4 py-3 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <span>Pages</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSection === "pages" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSection === "pages" && (
            <div className="pb-2">
              <Link
                href="/movies"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Movies
              </Link>
              <Link
                href="/tv_series"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                TV Shows
              </Link>
              <Link
                href="/documentaries"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Documentaries
              </Link>
              <Link
                href="/sports"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sports
              </Link>
            </div>
          )}
        </div>

        {/* Blog */}
        <div className="border-b border-gray-800">
          <button
            onClick={() => toggleSection("blog")}
            className="w-full flex items-center justify-between px-4 py-3 text-white font-medium hover:bg-white/5 transition-colors"
          >
            <span>Blog</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openSection === "blog" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSection === "blog" && (
            <div className="pb-2">
              <Link
                href="/blog"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Blog List
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Menu - NavigationMenu */}
      <NavigationMenu
        viewport={false}
        className="relative hidden xl:block"
        style={{ zIndex: 9999 }}
      >
        <NavigationMenuList className="space-x-2">
          {/* Home */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-white hover:text-purple-400 hover:bg-white/10">
              Home
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-56 gap-2 p-2">
                <ListItem href="/" title="Home Default" />
                <ListItem href="/home-v2" title="Home V2" />
                <ListItem href="/home-v3" title="Home V3" />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-white hover:text-purple-400 hover:bg-white/10">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent className="!p-0 !bg-transparent !shadow-none">
              <MegaMenu />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Pages */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-white hover:text-purple-400 hover:bg-white/10">
              Pages
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-56 gap-2 p-2">
                <ListItem href="/movies" title="Movies" />
                <ListItem href="/tv_series" title="TV Shows" />
                <ListItem href="/documentaries" title="Documentaries" />
                <ListItem href="/sports" title="Sports" />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Blog */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-white hover:text-purple-400 hover:bg-white/10">
              Blog
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-48 gap-2 p-2">
                <ListItem href="/blog" title="Blog List" />
                <ListItem href="/blog/single" title="Blog Single" />
                <ListItem href="/blog/category" title="Blog Category" />
                <ListItem href="/blog/author" title="Blog Author" />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}

function ListItem({ title, href }: { title: string; href: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-purple-400/10 hover:text-purple-400 focus:bg-purple-400/10"
        >
          <div className="text-sm font-medium">{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
