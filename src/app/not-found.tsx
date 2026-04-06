import { Play } from "lucide-react";
import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center px-4 py-16 text-white relative overflow-hidden">
      {/* Background blur lights */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          CINEMAKATOK
        </span>
        <span className="text-xs text-purple-300 font-semibold">TV</span>
      </div>

      {/* Card */}
      <div className="max-w-lg w-full bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center border border-gray-800 relative z-10">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 flex items-center justify-center bg-gradient-to-br from-purple-700/40 to-blue-600/30 rounded-full border border-purple-500/30">
            <span className="text-6xl">🧐</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-transparent">
          Lost your way?
        </h1>

        {/* Description */}
        <p className="text-gray-300 mb-10 leading-relaxed">
          The page you’re looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-purple-500/40"
          >
            Back to Home
          </Link>
          <Link
            href="/help"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-purple-300 border border-purple-500/40 hover:bg-purple-500/10 transition-all duration-300"
          >
            Visit Help Center
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-10 text-sm text-gray-400">
          Still need help?{" "}
          <Link
            href="/contact"
            className="text-purple-400 font-medium hover:underline"
          >
            Contact us
          </Link>{" "}
          or explore our{" "}
          <Link
            href="/help"
            className="text-purple-400 font-medium hover:underline"
          >
            Help section
          </Link>
          .
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
