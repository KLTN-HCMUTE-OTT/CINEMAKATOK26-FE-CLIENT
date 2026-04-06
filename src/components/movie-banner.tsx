"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface MovieBannerProps {
  imageUrl: string;
  title: string;
  id: string;
  buttonText?: string;
}

export function MovieBanner({
  imageUrl,
  title,
  buttonText = "Streaming Now",
  id,
}: MovieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigating to:", `/movies/${title}-${id}`);
    router.push(`/movies/${title}-${id}`);
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-black">
      {/*  Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/*  Overlay layers - không chặn click */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/*  Content layer - nằm trên cùng, có thể click */}
      <div className="relative z-20 h-full flex items-center px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl">
          {/* Title */}
          <div
            className={`transform transition-all duration-1000 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-16 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <h1
              className="text-6xl md:text-8xl lg:text-8xl font-black text-red-500 mb-12 leading-tight tracking-tight"
              style={{
                fontStyle: "italic",
                textShadow:
                  "0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3)",
              }}
            >
              {title.split(" ").map((word, index) => (
                <div
                  key={index}
                  className="inline-block mr-2 md:mr-4 transform hover:scale-110 transition-transform duration-300 cursor-default"
                  style={{
                    animation: `float ${2 + index * 0.3}s ease-in-out infinite`,
                  }}
                >
                  {word}
                </div>
              ))}
            </h1>
          </div>

          {/* Button */}
          <div
            className={`transform transition-all duration-1000 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-16 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <Button
              onClick={handleClick}
              className="group relative bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white font-bold text-lg md:text-xl px-12 py-7 md:py-8 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
              size="lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                {buttonText}
              </span>
              {/* Button glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative glow effects */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/30 blur-3xl rounded-full animate-pulse z-0" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-red-500/20 blur-3xl rounded-full z-0" />
      <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-orange-500/20 blur-2xl rounded-full z-0" />

      {/* Float animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
