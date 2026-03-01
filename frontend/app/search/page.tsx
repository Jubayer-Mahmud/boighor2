"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import FilterSidebar, { FilterState } from "@/components/FilterSidebar";
import Breadcrumb from "@/components/Breadcrumb";
import { Book } from "@/types";
import { Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  categoryId?: { _id: string; name: string; slug: string };
  stock: number;
  image: string;
  rating?: number;
  reviews?: unknown[];
}

function toBook(p: ApiProduct): Book {
  return {
    id: p._id,
    title: p.title,
    author: "",
    price: p.price,
    rating: p.rating || 0,
    reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
    category: p.categoryId?.slug || p.category || "",
    image: p.image || "https://placehold.co/200x280?text=Book",
    description: p.description,
    stock: p.stock,
  };
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    subjects: [],
    inStock: false,
  });

  // Local state for the inline search bar on this page
  const [inputValue, setInputValue] = useState(q);

  // Re-sync input when URL changes
  useEffect(() => { setInputValue(q); }, [q]);

  useEffect(() => {
    if (!q.trim()) { setBooks([]); return; }
    const load = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ search: q, limit: "100" });
        if (categoryParam) params.set("category", categoryParam);
        const res = await fetch(`${API}/products?${params.toString()}`);
        const data = await res.json();
        setBooks((data.data?.products || []).map(toBook));
      } catch {
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [q, categoryParam]);

  const filteredBooks = books.filter((book) => {
    if (book.price < filters.priceRange[0] || book.price > filters.priceRange[1]) return false;
    if (filters.inStock && book.stock === 0) return false;
    if (filters.subjects.length > 0 && !filters.subjects.includes(book.category)) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const params = new URLSearchParams();
    params.set("q", inputValue.trim());
    if (categoryParam) params.set("category", categoryParam);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Search Results" }]} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Search Results</h1>

          {/* Inline search bar so user can refine without scrolling up */}
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600"
              >
                <Search size={18} />
              </button>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Search
            </button>
          </form>

          {q && (
            <p className="mt-3 text-gray-600 text-sm">
              {isLoading
                ? "Searching…"
                : `${filteredBooks.length} result${filteredBooks.length !== 1 ? "s" : ""} for `}
              {!isLoading && <span className="font-semibold text-gray-800">"{q}"</span>}
              {categoryParam && !isLoading && (
                <span className="ml-1 text-gray-500">in <span className="font-medium capitalize">{categoryParam.replace(/-/g, " ")}</span></span>
              )}
            </p>
          )}
        </div>

        {/* Content */}
        {!q.trim() ? (
          <div className="py-20 text-center text-gray-500">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Type something to search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="hidden md:block">
              <FilterSidebar onFiltersChange={setFilters} />
            </aside>

            {/* Results grid */}
            <div className="md:col-span-3">
              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                  <p className="mt-3 text-gray-600">Searching…</p>
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-16 text-center">
                  <Search size={40} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 text-lg font-medium">No books found</p>
                  <p className="text-gray-400 text-sm mt-1">Try different keywords or browse a category</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
