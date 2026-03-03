"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    label: "HSC",
    slug: "hsc",
    image: "https://res.cloudinary.com/dtlh5rqxg/image/upload/v1772470912/High-Energy_Sale_Poster_with_Gradient_Background_swd9pg.png",
  },
  {
    label: "SSC",
    slug: "ssc",
    image: "https://res.cloudinary.com/dtlh5rqxg/image/upload/v1772470911/Bold_Sale_Poster_with_Geometric_Elements_vtrago.png",
  },
  {
    label: "Admission",
    slug: "admission",
    image: "https://res.cloudinary.com/dtlh5rqxg/image/upload/v1772470920/Vibrant_Sale_Poster_with_Handwritten_Typography_gyourl.png",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HeroCarouselProps {
  categories?: unknown[];
}

export default function HeroCarousel({ categories: _ }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const total = SLIDES.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [total]);

  const next = () => setCurrentSlide((p) => (p + 1) % total);
  const prev = () => setCurrentSlide((p) => (p === 0 ? total - 1 : p - 1));

  return (
    <div className="relative w-full h-72 md:h-[480px] rounded-2xl overflow-hidden shadow-lg bg-white">

      {/* Slides */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.slug}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              isActive ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <Link href={`/category/${slide.slug}`} className="block w-full h-full">
              <Image
                src={slide.image}
                alt={slide.label}
                fill
                className="object-contain"
                priority={index === 0}
              />
            </Link>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition z-20 backdrop-blur-sm"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition z-20 backdrop-blur-sm"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-8 bg-white" : "w-2 bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
