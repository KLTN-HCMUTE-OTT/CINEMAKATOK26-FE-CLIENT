import { AppSidebar } from "@/components/app-sidebar";
import { BannerCarousel } from "@/components/banner-carousel";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import MovieListGrid from "@/components/movie-list-grid";

export const metadata = {
  title: "Movies | My App",
  description: "Browse the movies",
};

interface Props {
  params: Promise<{ type: string }>;
}

export default async function MoviesPage({ params }: Props) {
  const resolvedParams = await params;
  const type = resolvedParams.type || "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />
      <BannerCarousel />
      <main className="pt-6">
        <div className="px-6 grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* Sidebar trái */}
          <div className="lg:col-span-3">
            <AppSidebar type="movies" />
          </div>

          {/* Nội dung phải */}
          <div className="lg:col-span-7">
            <div className="space-y-12 mt-6">
              <MovieListGrid type={type} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
