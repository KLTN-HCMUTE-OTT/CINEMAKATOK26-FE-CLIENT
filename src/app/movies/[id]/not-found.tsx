import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function MovieDetailNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="relative" />
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-8xl mb-8">🎥</div>
          <h1 className="text-6xl font-bold text-purple-500">404</h1>
          <h2 className="text-3xl font-bold text-white">Movie Not Found</h2>
          <p className="text-xl text-gray-400">
            The movie you&apos;re looking for doesn&apos;t exist or may have
            been removed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/movies"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Browse All Movies
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
