"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserX, Home, Search, ArrowLeft } from "lucide-react";

export default function PersonNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col">
      <Header variant="relative" />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-full border border-white/10">
                <UserX className="w-24 h-24 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold text-white">404</h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Không tìm thấy người này
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Rất tiếc, chúng tôi không thể tìm thấy thông tin về người bạn đang
              tìm kiếm. Có thể đường dẫn không chính xác hoặc người này đã bị
              xóa.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="bg-gray-800/50 border-white/10 text-white hover:bg-gray-700 hover:border-purple-500/30 transition-all duration-300 px-6 py-6 text-base rounded-xl w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>

            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>

            <Button
              onClick={() => router.push("/search?type=person")}
              variant="outline"
              className="bg-gray-800/50 border-white/10 text-white hover:bg-gray-700 hover:border-purple-500/30 transition-all duration-300 px-6 py-6 text-base rounded-xl w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Suggestions */}
          <div className="pt-8 space-y-4">
            <p className="text-gray-500 text-sm">Bạn có thể thử:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => router.push("/actors")}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 hover:border-purple-500/30 rounded-lg text-gray-300 hover:text-white text-sm transition-all duration-300"
              >
                Danh sách diễn viên
              </button>
              <button
                onClick={() => router.push("/directors")}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 hover:border-purple-500/30 rounded-lg text-gray-300 hover:text-white text-sm transition-all duration-300"
              >
                Danh sách đạo diễn
              </button>
              <button
                onClick={() => router.push("/movies")}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-white/5 hover:border-purple-500/30 rounded-lg text-gray-300 hover:text-white text-sm transition-all duration-300"
              >
                Xem phim
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
