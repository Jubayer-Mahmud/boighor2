"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

// Gradient palette — cycles for however many categories exist
const GRADIENTS = [
  "from-orange-500 via-orange-600 to-amber-500",
  "from-blue-600 via-blue-700 to-indigo-600",
  "from-emerald-500 via-teal-600 to-cyan-600",
  "from-violet-600 via-purple-600 to-fuchsia-500",
  "from-rose-500 via-red-500 to-pink-600",
  "from-sky-500 via-cyan-500 to-teal-500",
];

const SUBTITLES = [
  "Explore our full collection",
  "Your path to excellence",
  "Top picks for you",
  "Best books, best prices",
  "Start learning today",
  "Grade‑by‑grade selection",
];

interface HeroCarouselProps {
  categories?: Category[];
}

export default function HeroCarousel({ categories = [] }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = categories.length > 0 ? categories : null;
  const total = slides ? slides.length : 0;

  useEffect(() => {
    if (total < 2) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [total]);

  const next = () => setCurrentSlide((p) => (p + 1) % total);
  const prev = () => setCurrentSlide((p) => (p === 0 ? total - 1 : p - 1));

  // Loading / empty state
  if (!slides) {
    return (
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
        <div className="text-white text-center">
          <BookOpen size={48} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-3xl md:text-5xl font-bold">BUETian's BoiGhor</h2>
          <p className="text-lg md:text-xl mt-2 opacity-90">Your one‑stop book store</p>
          <Link href="/" className="mt-6 inline-block px-8 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition shadow">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">

      {/* Slides */}
      {slides.map((cat, index) => {
        const gradient = GRADIENTS[index % GRADIENTS.length];
        const subtitle = SUBTITLES[index % SUBTITLES.length];
        const isActive = index === currentSlide;

        return (
          <div
            key={cat._id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              isActive ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            {/* Background gradient */}
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>

              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white opacity-10 rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white opacity-10 rounded-full" />
              <div className="absolute top-8 left-8 w-20 h-20 bg-white opacity-5 rounded-full" />

              {/* Content */}
              <div className="relative text-white text-center px-6 z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                  {cat.name}
                </h2>
                <p className="text-base md:text-xl mt-2 opacity-90 font-medium">{subtitle}</p>

                <Link
                  href={`/category/${cat.slug}`}
                  className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-800 font-bold rounded-xl hover:bg-opacity-90 transition shadow-lg text-sm md:text-base"
                >
                  <BookOpen size={18} />
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
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
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-8 bg-white" : "w-2 bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
