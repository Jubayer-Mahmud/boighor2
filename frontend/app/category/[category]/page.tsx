"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import FilterSidebar, { FilterState } from "@/components/FilterSidebar";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Book } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface CatNode {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: CatNode[];
}

interface ApiProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  categoryId?: { _id: string; name: string; slug: string; parentId?: string | null };
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.category as string;

  const [catNode, setCatNode] = useState<CatNode | null>(null);
  const [parentNode, setParentNode] = useState<CatNode | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    subjects: [],
    inStock: false,
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/products?category=${encodeURIComponent(slug)}&limit=100`),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        // Find the current category in the flat list
        const allCats: CatNode[] = catData.categories || [];
        const found = allCats.find((c) => c.slug === slug) || null;
        setCatNode(found);

        // Find parent and attach children
        if (found?.parentId) {
          const parent = allCats.find((c) => c._id === found.parentId) || null;
          if (parent) {
            parent.children = allCats.filter((c) => c.parentId === parent._id);
          }
          setParentNode(parent);
        } else if (found) {
          // It's a parent — attach its children
          found.children = allCats.filter((c) => c.parentId === found._id);
          setParentNode(null);
        }

        setBooks((prodData.data?.products || []).map(toBook));
      } catch (err) {
        console.error("Failed to load category products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const filteredBooks = books.filter((book) => {
    if (book.price < filters.priceRange[0] || book.price > filters.priceRange[1]) return false;
    if (filters.inStock && book.stock === 0) return false;
    if (filters.subjects.length > 0 && !filters.subjects.includes(book.category)) return false;
    return true;
  });

  const isParentCat = !catNode?.parentId && (catNode?.children || []).length > 0;

  // Breadcrumb items
  const breadcrumbItems = parentNode
    ? [
        { label: parentNode.name, href: `/category/${parentNode.slug}` },
        { label: catNode?.name || slug },
      ]
    : [{ label: catNode?.name || slug }];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {catNode?.name || slug}
          </h1>
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `Showing ${filteredBooks.length} book${filteredBooks.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Sub-category tabs — only for parent categories */}
        {isParentCat && (catNode?.children || []).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href={`/category/${slug}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-orange-600 text-white"
            >
              All {catNode!.name}
            </Link>
            {(catNode?.children || []).map((child) => (
              <Link
                key={child._id}
                href={`/category/${child.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <FilterSidebar onFiltersChange={setFilters} parentCategorySlug={slug} />
          </aside>

          {/* Books Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                <p className="mt-3 text-gray-600">Loading books...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No books found in this category yet.</p>
                {isParentCat && (catNode?.children || []).length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try browsing a sub-category above.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
