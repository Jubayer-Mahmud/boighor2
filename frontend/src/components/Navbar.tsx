"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
}

// Desktop dropdown item for a single category (with or without sub-cats)
function NavCatItem({ cat }: { cat: Category }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChildren = (cat.children || []).length > 0;

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!hasChildren) {
    return (
      <Link
        href={`/category/${cat.slug}`}
        className="px-3 py-2 text-sm text-gray-700 hover:text-orange-600 hover:bg-white rounded transition whitespace-nowrap"
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-orange-600 hover:bg-white rounded transition whitespace-nowrap"
      >
        {cat.name}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {/* Link to all products in this parent category */}
          <Link
            href={`/category/${cat.slug}`}
            className="block px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition border-b border-gray-100"
            onClick={() => setOpen(false)}
          >
            All {cat.name}
          </Link>
          {(cat.children || []).map((child) => (
            <Link
              key={child._id}
              href={`/category/${child.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
              onClick={() => setOpen(false)}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile accordion item
function MobileCatItem({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = (cat.children || []).length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={`/category/${cat.slug}`}
        className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded"
        onClick={onClose}
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded"
      >
        <span>{cat.name}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-100 pl-3">
          <Link
            href={`/category/${cat.slug}`}
            className="block px-2 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded"
            onClick={onClose}
          >
            All {cat.name}
          </Link>
          {(cat.children || []).map((child) => (
            <Link
              key={child._id}
              href={`/category/${child.slug}`}
              className="block px-2 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded"
              onClick={onClose}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { user, isLoggedIn, logout, init } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [tree, setTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Rehydrate auth from localStorage once on mount
  useEffect(() => { init(); }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((data) => {
        setFlat(
          (data.categories || [])
            .filter((c: Category) => !c.parentId)
            .sort((a: Category, b: Category) => a.name.localeCompare(b.name))
        );
        setTree(
          (data.tree || []).sort((a: Category, b: Category) => a.name.localeCompare(b.name))
        );
      })
      .catch(() => {});
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  const handleSearch = (q: string, cat: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const params = new URLSearchParams();
    params.set("q", trimmed);
    if (cat) params.set("category", cat);
    router.push(`/search?${params.toString()}`);
  };

  const onDesktopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, searchCategory);
  };

  const onMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(mobileSearchQuery, "");
    closeMobile();
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        {/* Top bar */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/dtlh5rqxg/image/upload/v1772185178/Gemini_Generated_Image_jva3dxjva3dxjva3_xdlqkb.png"
                alt="BUETian's BoiGhor"
                className="h-16 w-auto object-contain"
              />
            </Link>

            {/* Search Bar — desktop only */}
            <form onSubmit={onDesktopSubmit} className="hidden md:flex flex-1 mx-8 items-center">
              <div className="w-full flex gap-2">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {flat.map((cat) => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-orange-500"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600">
                    <Search size={20} />
                  </button>
                </div>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-orange-600 transition"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="hidden md:flex gap-2 items-center">
                {isLoggedIn ? (
                  <>
                    <span className="text-sm text-gray-700 font-medium">
                      👋 {user?.name?.split(" ")[0]}
                    </span>                    <Link
                      href="/profile"
                      className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:border-orange-500 hover:text-orange-600 transition"
                    >
                      Profile
                    </Link>                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:border-red-400 hover:text-red-600 transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:border-orange-600 transition text-sm">Login</Link>
                    <Link href="/signup" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition text-sm">Sign Up</Link>
                  </>
                )}
              </div>

              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={onMobileSubmit} className="md:hidden px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-orange-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Desktop category bar — hover dropdowns */}
          <div className="hidden md:block border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-1 py-1">
              {tree.map((cat) => (
                <NavCatItem key={cat._id} cat={cat} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu — accordion dropdowns */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-1">
              {tree.map((cat) => (
                <MobileCatItem key={cat._id} cat={cat} onClose={closeMobile} />
              ))}
              <div className="pt-3 border-t border-gray-200">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <p className="px-3 text-sm text-gray-600 font-medium">👋 {user?.name}</p>
                    <button
                      onClick={() => { handleLogout(); closeMobile(); }}
                      className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1 px-3 py-2 text-center text-gray-700 border border-gray-300 rounded hover:border-orange-600" onClick={closeMobile}>Login</Link>
                    <Link href="/signup" className="flex-1 px-3 py-2 text-center bg-orange-600 text-white rounded hover:bg-orange-700" onClick={closeMobile}>Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

    </>
  );
}
