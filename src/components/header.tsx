"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Globe, ChevronDown, Play, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MegaMenu } from "@/components/mega-menu";
import LoginModal from "@/components/login-modal";
import RegisterModal from "@/components/register-modal";
import { SearchDropdown } from "@/components/search-dropdown";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSubItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import NavMenu from "./nav-menu";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  variant?: "fixed" | "absolute" | "relative";
}

export function Header({ variant = "fixed" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(
    null
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Use auth hook
  const { user, logout } = useAuth();

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for open login modal event
  useEffect(() => {
    const handleOpenLoginModal = (e?: any) => {
      // Check if container is provided in event detail
      if (e?.detail?.container) {
        setModalContainer(e.detail.container);
      } else {
        setModalContainer(null);
      }
      setIsLoginModalOpen(true);
    };
    window.addEventListener("open-login-modal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  // Refs for hover delay management
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  // Cleanup function
  const clearAllTimeouts = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Scroll detection for hiding/showing header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if at top of page
      if (currentScrollY < 10) {
        setIsAtTop(true);
        setIsVisible(true);
      } else {
        setIsAtTop(false);
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <header
        data-variant={variant}
        className={`${
          variant === "fixed" || variant === "absolute" ? variant : "relative"
        } left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          variant === "fixed" && isVisible
            ? "translate-y-0"
            : variant === "fixed" && !isVisible
            ? "-translate-y-full"
            : ""
        } ${
          variant === "relative"
            ? "bg-gray-900"
            : isAtTop && (variant === "fixed" || variant === "absolute")
            ? "bg-transparent"
            : "bg-gray-900"
        }`}
        style={
          variant === "fixed" || variant === "absolute" ? { top: 0 } : undefined
        }
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 lg:space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-red-500 text-lg lg:text-xl font-bold">
                  CINEMAKATOK
                </span>
                <span className="text-xs text-gray-400 font-normal hidden sm:inline">
                  TV
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden xl:block">
                <NavMenu />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search - Desktop with dropdown wrapper */}
              <div className="hidden xl:block relative" data-search-form>
                <form
                  onSubmit={handleSearch}
                  className="flex items-center border border-white/20 rounded-full px-4 py-2 min-w-[300px]"
                >
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Find movies, TV shows and more..."
                    className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 text-sm"
                  />
                </form>

                {/* Search Dropdown - Inside relative container */}
                <SearchDropdown
                  isOpen={isSearchOpen}
                  onClose={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                />
              </div>

              {/* Search Icon for tablet/mobile */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="xl:hidden text-white hover:text-purple-400 transition-colors p-2"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language - Hidden on small screens */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 text-white hover:text-purple-400 transition-colors focus:outline-none">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm hidden lg:inline">EN</span>
                      <ChevronDown className="w-3 h-3 hidden lg:inline" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Vietnamese
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Japanese
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      French
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Avatar/Login Button */}
              {isMounted && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-purple-400 transition-colors focus:outline-none">
                      {user.avatar && typeof user.avatar === "string" ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push("/profile")}
                    >
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push("/profile/watchlist")}
                    >
                      My Watchlist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white hover:text-purple-400 transition-colors focus:outline-none"
                >
                  <User className="w-4 h-4" />
                </button>
              )}

              {/* Subscribe - Hidden on mobile */}
              <Button className="hidden sm:flex bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 lg:px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm">
                Subscribe
              </Button>

              {/* Mobile/Tablet Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden text-white hover:text-purple-400 transition-colors p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="xl:hidden bg-gray-900 border-t border-white/10 py-4 px-4">
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-white/20 rounded-full px-4 py-2"
              >
                <Search className="w-4 h-4 text-gray-400 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onFocus={() => {}}
                  placeholder="Find movies, TV shows and more..."
                  className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 text-sm"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile/Tablet Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile/Tablet Menu Sidebar */}
      <div
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-sm bg-gray-900
          transform transition-transform duration-300 ease-in-out
          xl:hidden overflow-y-auto
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 space-y-4">
          {/* Close button */}
          <div className="flex items-center justify-between mb-20"></div>

          <NavMenu />

          {/* Mobile Subscribe Button */}
          <div className="sm:hidden px-4">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-full">
              Subscribe
            </Button>
          </div>

          {/* Mobile Language Selector */}
          <div className="md:hidden px-4">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm">Language</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-1 text-white hover:text-purple-400 transition-colors">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">EN</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem className="cursor-pointer">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Vietnamese
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Japanese
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    French
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setModalContainer(null);
        }}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        container={modalContainer}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setModalContainer(null);
        }}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        container={modalContainer}
      />
    </>
  );
}
