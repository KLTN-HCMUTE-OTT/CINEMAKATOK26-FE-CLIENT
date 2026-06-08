import { BannerCarousel } from "@/components/banner-carousel";
import { MovieListCard } from "@/components/expanding-movie-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MovieDetailHero } from "@/components/movie-detail-hero";
import MovieList from "@/components/movie-list";
import { RankList } from "@/components/rank-list";

export default function MoviePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />
      <BannerCarousel />
      <main className="pt-6">
        {/* Content */}
        <div className="px-6 grid grid-cols-10 gap-6">
          {/* Cột trái (3/10) - Sticky Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-6 self-start overflow-hidden mt-6">
              <RankList title="Top 10 Movies" showFilterTabs={false} />
            </div>
          </div>

          {/* Cột phải (7/10) */}
          <div className="col-span-7">
            {/* Nội dung bên phải */}
            <div className="space-y-12 mt-6 overflow-hidden">
              <MovieDetailHero />
              <MovieList type="all" title="All Movies" />
              <MovieList type="top-rated" title="Top Rated Movies" />
            </div>
          </div>
        </div>
        <div className="flex space-x-4 overflow-x-hidden">
          <MovieListCard
            type="trending"
            title="Trending Movies"
            viewAll={false}
            slidesToShow={5}
          />
          {/* Thay đổi tên component khi sử dụng */}
          <MovieListCard
            type="new-release"
            title="New Release Movies"
            viewAll={false}
            slidesToShow={5}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
