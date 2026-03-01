"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { Book } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import RatingStars from "./RatingStars";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const discountPercent = book.discountPrice
    ? Math.round(((book.price - book.discountPrice) / book.price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      {/* Image Container */}
      <Link href={`/products/${book.id}`}>
        <div className="relative overflow-hidden bg-gray-100 h-32 sm:h-36 md:h-52">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
              -{discountPercent}%
            </div>
          )}
          {book.stock < 10 && book.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Stock: {book.stock}
            </div>
          )}
          {book.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-2 md:p-3">
        {/* Title */}
        <Link href={`/products/${book.id}`}>
          <h3 className="font-semibold text-gray-800 line-clamp-2 h-10 text-xs md:text-sm hover:text-orange-600 transition">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-xs text-gray-600 mt-0.5 truncate">
          {book.author}
        </p>

        {/* Rating */}
        <div className="mt-1">
          <RatingStars rating={book.rating} size={12} showText={true} />
          <p className="text-xs text-gray-500">({book.reviews} reviews)</p>
        </div>

        {/* Price */}
        <div className="mt-1 flex items-end gap-1">
          <span className="text-base md:text-lg font-bold text-orange-600">
            ৳{book.discountPrice || book.price}
          </span>
          {book.discountPrice && (
            <span className="text-xs md:text-sm text-gray-500 line-through">
              ৳{book.price}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-2 flex flex-col gap-1.5">
          <button
            onClick={() => { addItem(book); router.push("/checkout"); }}
            disabled={book.stock === 0}
            className={`w-full py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 text-sm md:text-base ${
              book.stock === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            <Zap size={16} />
            Order Now
          </button>
          <button
            onClick={() => addItem(book)}
            disabled={book.stock === 0}
            className={`w-full py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 text-sm md:text-base ${
              book.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-orange-600 border border-orange-600 hover:bg-orange-50"
            }`}
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
