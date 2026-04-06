import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { FavoriteMovies } from "@/components/profile/favorite-movies";
import { HistorySection } from "@/components/profile/history-section";
import { WatchlistSection } from "@/components/profile/watchlist-section";
import { ProfileInfoSection } from "@/components/profile/profile-info-section";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const validTabs = ["profile", "favorites", "history", "watchlist"];

interface ProfilePageProps {
  params: Promise<{
    tab?: string[];
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Await params trong Next.js 15
  const resolvedParams = await params;
  const currentTab = resolvedParams.tab?.[0] || "profile";

  // Validate tab
  if (!validTabs.includes(currentTab)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />
      <div className="container w-full max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <ProfileHeader />

        {/* Tabs navigation */}
        <ProfileTabs currentTab={currentTab} />

        {/* Content based on active tab */}
        <div className="mt-8">
          {currentTab === "profile" && <ProfileInfoSection />}
          {currentTab === "favorites" && <FavoriteMovies />}
          {currentTab === "history" && <HistorySection />}
          {currentTab === "watchlist" && <WatchlistSection />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Generate static params cho SEO
export function generateStaticParams() {
  return validTabs.map((tab) => ({
    tab: [tab],
  }));
}

// Metadata cho từng tab
export async function generateMetadata({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const currentTab = resolvedParams.tab?.[0] || "favorites";

  const titles: Record<string, string> = {
    profile: "Personal Information",
    favorites: "My Favorites",
    history: "Watch History",
    watchlist: "My Watchlist",
  };

  return {
    title: `${titles[currentTab]} - Profile`,
    description: `View your ${titles[currentTab].toLowerCase()}`,
  };
}
