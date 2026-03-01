"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import CategorySection from "@/components/CategorySection";
import { Book } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
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

export default function Home() {
  const [tree, setTree] = useState<Category[]>([]);
  const [productsBySlug, setProductsBySlug] = useState<Record<string, Book[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/products?limit=200`),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        const fetchedTree: Category[] = (catData.tree || []).sort((a: Category, b: Category) => a.name.localeCompare(b.name));
        setTree(fetchedTree);

        // Map every product by its categoryId slug (or category string)
        const products: ApiProduct[] = prodData.data?.products || [];
        const bySlug: Record<string, Book[]> = {};
        for (const p of products) {
          const slug = p.categoryId?.slug || p.category || "uncategorized";
          if (!bySlug[slug]) bySlug[slug] = [];
          bySlug[slug].push(toBook(p));
        }
        setProductsBySlug(bySlug);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Collect books for a main category: include parent-slug products + all sub-category-slug products
  const getBooksForParent = (cat: Category): Book[] => {
    const slugs = [cat.slug, ...(cat.children || []).map((c) => c.slug)];
    return slugs.flatMap((s) => productsBySlug[s] || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Carousel */}
        <section className="py-8">
          <HeroCarousel categories={tree} />
        </section>

        {/* Trust Badge */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-600">50K+</div>
            <p className="text-gray-600 text-sm mt-2">Book Titles</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">100K+</div>
            <p className="text-gray-600 text-sm mt-2">Happy Customers</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">1M+</div>
            <p className="text-gray-600 text-sm mt-2">Orders Delivered</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <p className="text-gray-600 text-sm mt-2">Customer Support</p>
          </div>
        </section>

        {/* Category Sections — one per main (top-level) category */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : tree.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-xl font-medium">No categories yet.</p>
            <p className="text-sm mt-2">Add categories and products from the admin panel.</p>
          </div>
        ) : (
          tree.map((cat, idx) => {
            const books = getBooksForParent(cat);
            return (
              <React.Fragment key={cat._id}>
                <CategorySection
                  title={cat.name}
                  books={books}
                  categorySlug={cat.slug}
                />
                {idx < tree.length - 1 && (
                  <div className="my-8 border-t border-gray-200" />
                )}
              </React.Fragment>
            );
          })
        )}
      </main>

      <Footer />
    </div>
  );
}
