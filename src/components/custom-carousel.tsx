import type React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/dist/client/components/navigation";

interface CustomCarouselProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  title?: string;
  slidesToShow?: number; // Number of slides to show at once
  loop?: boolean;
  className?: string;
  showViewAll?: boolean; // Whether to show the "View All" button
  edgePadding?: number; // Extra space before first and after last slide for scaled cards
  urlNavigate?: string; // URL to navigate when "View All" is clicked
}

export function CustomCarousel<T>({
  items,
  renderCard,
  title,
  slidesToShow = 4,
  loop = false,
  className = "",
  showViewAll = false,
  edgePadding = 0,
  urlNavigate,
}: CustomCarouselProps<T>) {
  const router = useRouter();
  const containerClassName = cn("w-full", className);
  const handleViewAllClick = () => {
    // Implement navigation logic here, e.g., using Next.js router
    if (urlNavigate) {
      router.push(urlNavigate);
    }
  };
  return (
    <div className={containerClassName}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {showViewAll && (
          <button
            className="text-blue-400 hover:text-blue-300 transition-colors"
            onClick={handleViewAllClick}
          >
            View All
          </button>
        )}
      </div>
      <div className="flex gap-x-6">
        <Carousel
          opts={{
            align: "start",
            loop: loop,
            slidesToScroll: 1,
          }}
          className="w-full overflow-visible"
        >
          <CarouselContent
            allowOverflow={true}
            className="-ml-2 md:-ml-4 overflow-visible"
          >
            {items.map((item, index) => {
              // Calculate basis based on slidesToShow
              const basisClass =
                slidesToShow === 1
                  ? "basis-full"
                  : slidesToShow === 2
                  ? "basis-1/2 md:basis-1/2"
                  : slidesToShow === 3
                  ? "basis-1/2 md:basis-1/3"
                  : slidesToShow === 4
                  ? "basis-1/2 md:basis-1/3 lg:basis-1/4"
                  : slidesToShow === 5
                  ? "basis-1/2 md:basis-1/3 lg:basis-1/5"
                  : "basis-1/2 md:basis-1/3 lg:basis-1/4";

              const itemClassName = cn(
                "relative overflow-visible",
                "pl-2 md:pl-4", // Thêm padding cho tất cả items để có khoảng cách
                basisClass
              );

              return (
                <CarouselItem
                  key={index}
                  className={itemClassName}
                  style={{
                    marginLeft:
                      index === 0 && edgePadding ? edgePadding : undefined,
                    marginRight:
                      index === items.length - 1 && edgePadding
                        ? edgePadding
                        : undefined,
                    padding: "2rem 1rem", // Thêm padding để card có thể scale và đẩy
                  }}
                >
                  {renderCard(item, index)}
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious className="left-0 -translate-x-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70" />
          <CarouselNext className="right-0 translate-x-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70" />
        </Carousel>
      </div>
    </div>
  );
}
