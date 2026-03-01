"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Book } from "@/types";
import BookCard from "./BookCard";

interface CategorySectionProps {
  title: string;
  books: Book[];
  categorySlug: string;
  isScrollable?: boolean;
}

export default function CategorySection({
  title,
  books,
  categorySlug,
  isScrollable = false,
}: CategorySectionProps) {
  const useScroll = books.length > 5;

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          {title}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-700 transition"
        >
          View All <ChevronRight size={20} />
        </Link>
      </div>

      {/* Books — horizontal scroll when > 5, grid otherwise */}
      {useScroll ? (
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-orange-300 [&::-webkit-scrollbar-track]:bg-gray-100">
          {books.map((book) => (
            <div key={book.id} className="min-w-[160px] md:min-w-[200px] flex-shrink-0">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
