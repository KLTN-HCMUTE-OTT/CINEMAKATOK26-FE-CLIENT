"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeroSection } from "@/components/hero-section";
import { NewReleases } from "@/components/new-releases";
import { PricingPlans } from "@/components/pricing-plans";
import { TopArtists } from "@/components/top-artists";
import { TopNews } from "@/components/top-news";
import { TvSeries } from "@/components/tv-series";
import { RecommendedTvShows } from "@/components/recommended-tv-shows";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { TrendingMoviesList } from "@/components/trending-movies";
import { useUIStore } from "@/store";
import { ActiveRoomsPreview } from "@/components/watch-party/active-rooms-preview";

function HomeContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  useEffect(() => {
    // Check if we need to open login modal
    if (searchParams.get("openLogin") === "true") {
      openLoginModal();

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("openLogin");
      window.history.replaceState({}, "", url.toString());
    }
  }, [openLoginModal, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header with fixed positioning to overlay on Hero */}
      <Header variant="fixed" />
      <HeroSection />

      {/* Wrapper with extra spacing for carousel sections */}
      <div className="space-y-16 py-8">
        {/* {isAuthenticated && <RecommendedTvShows />} */}
        <TrendingMoviesList page={1} limit={10} />
        <ActiveRoomsPreview />
        <NewReleases />
      </div>

      <div id="pricing">
        <PricingPlans />
      </div>

      <div className="space-y-16 py-8">
        <TopArtists />
        <TvSeries />
        <TopNews />
      </div>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
