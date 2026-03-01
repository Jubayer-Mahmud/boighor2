"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/useCartStore";
import { Book } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId?: { _id: string; name: string; slug: string };
  category?: string;
  stock: number;
  image: string;
  rating?: number;
  reviews?: unknown[];
}

function apiToBook(p: ApiProduct): Book {
  return {
    id: p._id,
    title: p.title,
    author: "",
    price: p.price,
    discountPrice: p.discountPrice,
    rating: p.rating || 0,
    reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
    category: p.categoryId?.slug || p.category || "",
    image: p.image || "https://placehold.co/200x280?text=Book",
    description: p.description,
    stock: p.stock,
  };
}

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [related, setRelated] = useState<Book[]>([]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0
  );
  const totalDiscount = items.reduce(
    (sum, item) => item.discountPrice ? sum + (item.price - item.discountPrice) * item.quantity : sum, 0
  );
  const deliveryCharge = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  // Fetch related products based on categories present in cart
  useEffect(() => {
    if (items.length === 0) { setRelated([]); return; }
    const cartIds = new Set(items.map((i) => i.id));
    const slugs = [...new Set(items.map((i) => i.category).filter(Boolean))];
    const load = async () => {
      try {
        const results = await Promise.all(
          slugs.slice(0, 2).map((slug) =>
            fetch(`${API}/products?category=${slug}&limit=8`).then((r) => r.json())
          )
        );
        const all: Book[] = results.flatMap((r) =>
          (r.data?.products || []).map(apiToBook).filter((b: Book) => !cartIds.has(b.id))
        );
        const seen = new Set<string>();
        setRelated(
          all.filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true; }).slice(0, 6)
        );
      } catch { /* ignore */ }
    };
    load();
  }, [items]);

  /* ── Empty state ─────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="bg-white rounded-3xl shadow-sm p-14 border border-gray-100">
            <ShoppingBag className="mx-auto text-orange-200 mb-6" size={80} strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-400 mb-8 text-sm">Add some books and come back here!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition"
            >
              Browse Books <ChevronRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Main layout ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-orange-600 transition">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">Shopping Cart ({items.length})</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ══════════════════════════════════════════════
              LEFT — Cart Item Cards
          ══════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Column header — desktop */}
            <div className="hidden md:grid grid-cols-[3fr_1fr_auto_1fr_auto] gap-4 px-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              <span>Product</span>
              <span className="text-center">Unit Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            {items.map((item) => {
              const unitPrice = item.discountPrice || item.price;
              const lineTotal = unitPrice * item.quantity;
              const discountPct = item.discountPrice
                ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  {/* ─ Desktop row ─ */}
                  <div className="hidden md:grid grid-cols-[3fr_1fr_auto_1fr_auto] gap-4 items-center px-5 py-4">

                    {/* Product info */}
                    <Link href={`/products/${item.id}`} className="flex items-center gap-4 group min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 object-cover rounded-xl border border-gray-100"
                          style={{ height: "88px" }}
                        />
                        {discountPct > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition line-clamp-2 text-sm leading-snug">
                          {item.title}
                        </p>
                        {item.author && (
                          <p className="text-xs text-gray-400 mt-1">by {item.author}</p>
                        )}
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium border border-orange-100">
                          {item.category || "Book"}
                        </span>
                      </div>
                    </Link>

                    {/* Unit price */}
                    <div className="text-center">
                      <p className="font-bold text-gray-800">৳{unitPrice}</p>
                      {item.discountPrice && (
                        <p className="text-xs text-gray-400 line-through">৳{item.price}</p>
                      )}
                    </div>

                    {/* Qty selector */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-bold text-gray-800 border-x border-gray-200 py-1.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <p className="text-right font-bold text-orange-600">৳{lineTotal}</p>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* ─ Mobile card ─ */}
                  <div className="flex gap-3 p-4 md:hidden">
                    <Link href={`/products/${item.id}`} className="relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded-xl border border-gray-100"
                      />
                      {discountPct > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.id}`}>
                        <p className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug hover:text-orange-600 transition">
                          {item.title}
                        </p>
                      </Link>
                      {item.author && <p className="text-xs text-gray-400 mt-0.5">by {item.author}</p>}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-orange-600">৳{unitPrice}</span>
                        {item.discountPrice && (
                          <span className="text-xs text-gray-400 line-through">৳{item.price}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-600 transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold border-x border-gray-200 py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-600 transition disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">৳{lineTotal}</span>
                          <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-600 transition font-medium mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT — Order Summary Panel
          ══════════════════════════════════════════════ */}
          <div className="w-full lg:w-85 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">

              {/* Panel header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Order Summary</h2>
              </div>

              <div className="px-6 py-5 space-y-5">

                {/* Per-item breakdown */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1 flex-1 mr-3 text-gray-500">
                        {item.title}
                        <span className="text-gray-400 text-xs"> ×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-700 whitespace-nowrap">
                        ৳{(item.discountPrice || item.price) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">৳{subtotal}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Tag size={12} /> Discount
                      </span>
                      <span className="font-semibold text-green-600">−৳{totalDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className={`font-semibold ${deliveryCharge === 0 ? "text-green-600" : "text-gray-800"}`}>
                      {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
                    </span>
                  </div>

                  {deliveryCharge > 0 && (
                    <div className="bg-orange-50 rounded-xl px-4 py-3 text-xs text-orange-600 leading-relaxed">
                      🚚 Add <span className="font-bold">৳{500 - subtotal}</span> more to get <span className="font-bold">free delivery</span>
                    </div>
                  )}
                </div>

                {/* Promo code */}
                <div className="border-t border-dashed border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Promo Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 bg-gray-50"
                    />
                    <button
                      onClick={() => promoCode && setPromoApplied(true)}
                      className="px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">✓ Promo code applied!</p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-base">Total Amount</span>
                  <span className="text-2xl font-extrabold text-orange-600">৳{total}</span>
                </div>
                {totalDiscount > 0 && (
                  <p className="text-xs text-green-600 -mt-3 text-right">
                    🎉 You save ৳{totalDiscount} on this order!
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 active:scale-95 transition text-base shadow-lg shadow-orange-100"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <p className="text-center text-[11px] text-gray-400 pb-1">
                  🔒 Secure & encrypted checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            Related Products
        ══════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">
                  Recommended for you
                </p>
                <h2 className="text-xl font-bold text-gray-800">You May Also Like</h2>
              </div>
              <span className="text-xs text-gray-400 hidden sm:block">Based on your cart</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((book) => {
                const price = book.discountPrice || book.price;
                const discount = book.discountPrice
                  ? Math.round(((book.price - book.discountPrice) / book.price) * 100) : 0;

                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <Link href={`/products/${book.id}`} className="relative block overflow-hidden bg-gray-50 aspect-3/4">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                    </Link>
                    <div className="p-3 flex flex-col flex-1 gap-1.5">
                      <Link href={`/products/${book.id}`}>
                        <h3 className="text-xs font-semibold text-gray-700 line-clamp-2 hover:text-orange-600 transition leading-snug">
                          {book.title}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-1.5 mt-auto">
                        <span className="font-bold text-orange-600 text-sm">৳{price}</span>
                        {book.discountPrice && (
                          <span className="text-[10px] text-gray-400 line-through">৳{book.price}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addItem(book)}
                        disabled={book.stock === 0}
                        className="mt-1 w-full py-1.5 text-[11px] font-semibold rounded-lg bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}