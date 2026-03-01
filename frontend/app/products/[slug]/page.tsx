"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  Package,
  Truck,
  RotateCcw,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import RatingStars from "@/components/RatingStars";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Book } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiReview {
  _id: string;
  user?: { _id: string; name: string } | null;
  text: string;
  rating: number;
  createdAt: string;
}

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
  reviews?: ApiReview[];
  specifications?: {
    pages?: number;
    publisher?: string;
    language?: string;
    isbn?: string;
  };
}

function toBook(p: ApiProduct): Book {
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
    specifications: p.specifications,
  };
}

export default function ProductPage() {
  const params = useParams();
  const bookId = params.slug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [rawReviews, setRawReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Share toast
  const [shareCopied, setShareCopied] = useState(false);

  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { isLoggedIn, token } = useAuthStore();

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    fetch(`${API}/products/${bookId}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const product: ApiProduct = data.product || data;
        setBook(toBook(product));
        setRawReviews(Array.isArray(product.reviews) ? product.reviews : []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="text-gray-500 text-lg">Loading…</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Book Not Found
            </h1>
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPercent = book.discountPrice
    ? Math.round(((book.price - book.discountPrice) / book.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(book, quantity);
    setQuantity(1);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, url });
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) { setReviewError("Please select a star rating."); return; }
    if (!isLoggedIn || !token) { router.push("/login"); return; }
    setSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch(`${API}/products/${bookId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, text: reviewText }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.message || "Failed to submit review."); return; }
      const updated: ApiProduct = data.product;
      setBook(toBook(updated));
      setRawReviews(Array.isArray(updated.reviews) ? updated.reviews : []);
      setReviewSuccess("Your review has been submitted!");
      setReviewText("");
      setReviewRating(0);
      setTimeout(() => { setShowReviewModal(false); setReviewSuccess(""); }, 1500);
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Products", href: "/" },
              { label: book.title },
            ]}
          />
        </div>

        {/* Product Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left - Image Gallery */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden sticky top-20">
              <div className="relative bg-gray-200 h-96 md:h-full">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                    -{discountPercent}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - Product Details */}
          <div>
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {book.title}
            </h1>

            {/* Author */}
            <p className="text-lg text-gray-600 mb-4">{book.author}</p>

            {/* Rating */}
            <div className="mb-6 flex items-center gap-4">
              <RatingStars rating={book.rating} size={20} showText={true} />
              <span className="text-gray-600">({book.reviews} reviews)</span>
            </div>

            {/* Price Section */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-orange-600">
                  ৳{book.discountPrice || book.price}
                </span>
                {book.discountPrice && (
                  <span className="text-2xl text-gray-500 line-through pb-2">
                    ৳{book.price}
                  </span>
                )}
              </div>
              {book.discountPrice && (
                <p className="text-green-600 font-semibold">
                  Save ৳{book.price - book.discountPrice}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {book.stock > 0 ? (
                <p className="text-green-600 font-semibold">
                  ✓ In Stock ({book.stock} available)
                </p>
              ) : (
                <p className="text-red-600 font-semibold">✗ Out of Stock</p>
              )}
            </div>

            {/* Quantity & Buttons */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { handleAddToCart(); router.push("/checkout"); }}
                  disabled={book.stock === 0}
                  className={`flex-1 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition ${
                    book.stock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  <Zap size={20} />
                  Order Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={book.stock === 0}
                  className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition border-2 ${
                    book.stock === 0
                      ? "border-gray-300 text-gray-400 cursor-not-allowed"
                      : "border-orange-600 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-6 py-3 rounded-lg border-2 font-semibold transition ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-300 text-gray-700 hover:border-red-500"
                  }`}
                >
                  <Heart
                    size={20}
                    className={isWishlisted ? "fill-current" : ""}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="relative px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-orange-600 transition"
                >
                  <Share2 size={20} />
                  {shareCopied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3">
                <Truck className="text-green-600 shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-800">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over ৳500</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw className="text-blue-600 shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-800">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="text-orange-600 shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-800">Secure Packaging</p>
                  <p className="text-sm text-gray-600">Safe & fast delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Description */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {book.description}
              </p>

              {/* Specifications */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Specifications
              </h3>
              <div className="space-y-2">
                {book.specifications?.pages && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-semibold">{book.specifications.pages}</span>
                  </div>
                )}
                {book.specifications?.publisher && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Publisher:</span>
                    <span className="font-semibold">
                      {book.specifications.publisher}
                    </span>
                  </div>
                )}
                {book.specifications?.language && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-semibold">
                      {book.specifications.language}
                    </span>
                  </div>
                )}
                {book.specifications?.isbn && (
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-600">ISBN:</span>
                    <span className="font-semibold">{book.specifications.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

              {/* Reviews summary */}
              <div>
              <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews</h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {book.rating.toFixed(1)}
                    </div>
                    <RatingStars rating={book.rating} size={18} showText={false} />
                    <p className="text-sm text-gray-600 mt-2">
                      Based on {rawReviews.length} review{rawReviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isLoggedIn) { router.push("/login"); return; }
                      setShowReviewModal(true);
                    }}
                    className="w-full py-2 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition"
                  >
                    Write a Review
                  </button>

                  {/* Review list */}
                  {rawReviews.length > 0 && (
                    <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
                      {rawReviews.map((r) => (
                        <div key={r._id} className="border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-gray-800">
                              {typeof r.user === "object" && r.user ? r.user.name : "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < r.rating ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"}>★</span>
                            ))}
                          </div>
                          {r.text && <p className="text-sm text-gray-600">{r.text}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </div>
        </div>
      </main>

      <Footer />

      {/* Review Modal */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowReviewModal(false); setReviewError(""); setReviewText(""); setReviewRating(0); } }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Write a Review</h3>
              <button onClick={() => { setShowReviewModal(false); setReviewError(""); setReviewText(""); setReviewRating(0); }} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* Star selector */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating *</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className="text-3xl transition"
                  >
                    <span className={(hoverRating || reviewRating) >= star ? "text-yellow-400" : "text-gray-300"}>★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Your Review (optional)</p>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this book…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {reviewError && <p className="text-red-600 text-sm mb-3">{reviewError}</p>}
            {reviewSuccess && <p className="text-green-600 text-sm mb-3">{reviewSuccess}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowReviewModal(false); setReviewError(""); setReviewText(""); setReviewRating(0); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-sm disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
