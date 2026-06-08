import { AppSidebar } from "@/components/app-sidebar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import TvSeriesListGrid from "@/components/tv_serie/section/tv-series-list-grid";
export const metadata = {
  title: "TV Series | My App",
  description: "Browse the TV series",
};

interface Props {
  params: Promise<{ type: string }>;
}

export default async function TvSeriesPage({ params }: Props) {
  const resolvedParams = await params;
  const type = resolvedParams.type || "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />
      <main className="pt-6">
        <div className="px-6 grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          {/* Sidebar trái */}
          <div className="lg:col-span-3">
            <AppSidebar type="tv_series" />
          </div>

          {/* Nội dung phải */}
          <div className="lg:col-span-7">
            <div className="space-y-12 mt-6">
              <TvSeriesListGrid type={type} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
