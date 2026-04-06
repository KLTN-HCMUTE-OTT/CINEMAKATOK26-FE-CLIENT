"use client";

import { useEffect, useState } from "react";

import { ApiErrorResponse } from "@/lib/api-error-handler";
import { categoryControllerFindAllWithCount } from "@/apis/api/categories";
import { toast } from "sonner";
import { useRouter } from "next/dist/client/components/navigation";
import { SkeletonCard } from "@/components/skeleton-card";
import { CustomCarousel } from "@/components/custom-carousel";

interface CategoryCardProps {
  id: string;
  categoryName: string;
  tvSeriesCount: number;
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function CategoryCard({
  id,
  categoryName,
  tvSeriesCount,
}: CategoryCardProps) {
  const router = useRouter();
  const bgColor = stringToColor(categoryName);
  const handleClick = () => {
    // Handle category click if needed
    router.push(`/tv_series/type/category/${categoryName}-${id}`);
  };
  return (
    <div
      className="relative w-56 h-32 rounded-xl p-4 text-white flex items-center overflow-hidden group cursor-pointer"
      style={{ backgroundColor: bgColor }}
      onClick={handleClick}
    >
      {/* Text */}
      <div className="z-10">
        <h3 className="text-lg font-semibold">{categoryName}</h3>
        <p className="text-sm opacity-80">{tvSeriesCount} Shows</p>
      </div>

      {/* Decorative box instead of image */}
      <div
        className="
          absolute right-4 bottom-4 w-20 h-20 rounded-xl 
          opacity-50 transition-transform duration-300 rotate-12 
          group-hover:rotate-0
        "
        style={{
          backgroundColor: "rgba(255,255,255,0.35)",
        }}
      />
    </div>
  );
}

export function TvSeriesCategoryList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<API.TVSeriesCategory[]>([]);

  useEffect(() => {
    /// call api to fetch categories if needed
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await categoryControllerFindAllWithCount();
        if (response?.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        // Handle error if needed
        const apiError = error as ApiErrorResponse;
        toast.error(
          apiError.message || "Không thể tải danh sách thể loại TV Series"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <section className="px-6 py-8 overflow-hidden">
      {loading ? (
        // sekeleton loader or placeholder can be added here
        <SkeletonCard />
      ) : (
        <CustomCarousel
          title="Featured TV Episodes"
          items={categories}
          renderCard={(item) => <CategoryCard {...item} />}
          showViewAll={false}
          slidesToShow={5}
        />
      )}
    </section>
  );
}
