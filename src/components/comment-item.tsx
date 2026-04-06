/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewProps {
  id: number;
  name: string;
  avatar: string;
  rating: number; // 1 to 5
  date: string;
  text: string;
}

function ReviewCard({ review }: { review: ReviewProps }) {
  return (
    <Card className=" overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-1">
              <img
                src={review.avatar}
                alt={review.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Stars */}
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating
                      ? "text-blue-500 fill-blue-500"
                      : "text-gray-600 fill-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Name */}
            <h3 className="text-white text-xl font-bold mb-1">{review.name}</h3>

            {/* Date */}
            <p className="text-gray-400 text-sm mb-4">{review.date}</p>

            {/* Review Text */}
            <p className="text-gray-300 text-base leading-relaxed">
              {review.text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Demo Component
export default function ReviewsList({ movieId }: { movieId: string }) {
  // Mock reviews data
  const reviews = [
    {
      id: 1,
      name: "Jane Doe",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      rating: 5,
      date: "September 20, 2024",
      text: "John Wick: Chapter 4 is a non-stop thrill ride, packed with jaw-dropping action, breathtaking visuals, and Keanu Reeves in peak form. The film masterfully expands the Wick universe while maintaining relentless intensity. With stunning choreography and standout performances, it's a must-see for action fans. Pure adrenaline from start to finish!",
    },
    {
      id: 2,
      name: "John Smith",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      rating: 4,
      date: "September 18, 2024",
      text: "An absolute masterpiece of action cinema. The fight sequences are incredibly well-choreographed, and Keanu Reeves delivers another stellar performance. The cinematography is stunning, making every frame look like a work of art. A must-watch for any action movie fan!",
    },
    {
      id: 3,
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      rating: 5,
      date: "September 15, 2024",
      text: "This movie exceeded all my expectations! The action scenes are intense and perfectly executed. The story keeps you engaged throughout, and the visual effects are top-notch. Keanu Reeves proves once again why he's the king of action movies. Highly recommended!",
    },
    {
      id: 4,
      name: "Mike Wilson",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      rating: 5,
      date: "September 12, 2024",
      text: "Simply phenomenal! The choreography is mesmerizing, the cinematography is beautiful, and the story is compelling. This is what action movies should be. Every scene is crafted with precision and care. A true cinematic experience that shouldn't be missed!",
    },
    {
      id: 5,
      name: "Emily Chen",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      rating: 4,
      date: "September 10, 2024",
      text: "An epic conclusion to an incredible franchise. The action is relentless, the visuals are stunning, and Keanu Reeves delivers an amazing performance. The world-building is excellent, and the fight scenes are some of the best I've ever seen. A must-see in theaters!",
    },
    {
      id: 6,
      name: "David Lee",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      rating: 5,
      date: "September 8, 2024",
      text: "Absolutely incredible! This movie sets a new standard for action films. The attention to detail, the choreography, and the performances are all outstanding. Every moment is thrilling and visually spectacular. This is peak cinema at its finest!",
    },
  ];

  return (
    <div className="min-h-screen  ">
      <div className="max-w-6xl ">
        {/* Reviews Grid */}
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
