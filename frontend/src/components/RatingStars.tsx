"use client";

import React from "react";
import { Star } from "lucide-react";
import { Book } from "@/types";

interface RatingStarsProps {
  rating: number;
  size?: number;
  showText?: boolean;
}

export default function RatingStars({
  rating,
  size = 16,
  showText = true,
}: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
      {showText && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
