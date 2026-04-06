import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InfoEpisodeCardList } from "@/components/tv_serie/card/info-episode-card";
import { PopularTvSeriesList } from "@/components/tv_serie/section/popluar-tvseries-list";
import { TvSeriesCardList } from "@/components/tv_serie/card/tv-series-card";
import TvSeriesCarousel from "@/components/tv_serie/tv-series-carousel";
import { TvSeriesCategoryList } from "@/components/tv_serie/card/tv-series-category-card";
export default function TvSeriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">
      {/* Header */}
      <Header variant="relative" />

      {/* Hero / Carousel */}
      <section className="relative ">
        <TvSeriesCarousel />
      </section>

      {/* TV Series Cards */}
      <section className="sm:px-6 lg:px-8  ">
        <TvSeriesCardList />
      </section>

      {/* Episode Info */}
      <section className="sm:px-6 lg:px-8  ">
        <InfoEpisodeCardList />
      </section>

      {/* Popular TV Series */}
      <section className="sm:px-6 lg:px-8  ">
        <PopularTvSeriesList />
      </section>

      {/* TV Series Categories */}
      <section className="sm:px-6 lg:px-8  ">
        <TvSeriesCategoryList />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
