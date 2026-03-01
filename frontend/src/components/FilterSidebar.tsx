"use client";

import React, { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
  /**
   * When provided, shows only sub-categories of this parent slug.
   * When omitted, shows all top-level categories.
   */
  parentCategorySlug?: string;
}

export interface FilterState {
  priceRange: [number, number];
  /** Expanded set of category slugs (includes children) — used for filtering */
  subjects: string[];
  inStock: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 2000],
  subjects: [],
  inStock: false,
};

export default function FilterSidebar({
  onFiltersChange,
  parentCategorySlug,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  /** The list rendered as checkboxes — either top-level or children of parentCategorySlug */
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then((data) => {
        const flat: Category[] = data.categories || [];
        setAllCategories(flat);
        deriveVisible(flat, parentCategorySlug);
      })
      .catch(() => {
        setAllCategories([]);
        setVisibleCategories([]);
      })
      .finally(() => setCategoriesLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentCategorySlug]);

  const deriveVisible = (flat: Category[], parentSlug?: string) => {
    if (parentSlug) {
      const parent = flat.find((c) => c.slug === parentSlug);
      if (parent) {
        const children = flat
          .filter((c) => c.parentId && c.parentId.toString() === parent._id.toString())
          .sort((a, b) => a.name.localeCompare(b.name));
        setVisibleCategories(children);
        return;
      }
    }
    // Default: show top-level categories
    setVisibleCategories(
      flat.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  /** When a top-level cat is selected, also expand its children into the emitted subjects array */
  const expandSlugs = (selected: string[], flat: Category[]): string[] => {
    const expanded = new Set<string>(selected);
    selected.forEach((slug) => {
      const node = flat.find((c) => c.slug === slug);
      if (node) {
        flat
          .filter((c) => c.parentId && c.parentId.toString() === node._id.toString())
          .forEach((child) => expanded.add(child.slug));
      }
    });
    return Array.from(expanded);
  };

  const handleCategoryToggle = (slug: string) => {
    const newSelected = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug];
    setSelectedSlugs(newSelected);

    // If we're showing subcategories (parentCategorySlug set), no need to expand further
    const subjects = parentCategorySlug
      ? newSelected
      : expandSlugs(newSelected, allCategories);
    const newFilters = { ...filters, subjects };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handlePriceChange = (value: number) => {
    const newFilters = { ...filters, priceRange: [0, value] as [number, number] };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedSlugs([]);
    onFiltersChange?.(DEFAULT_FILTERS);
  };

  const categoryTitle = parentCategorySlug ? "Sub-category" : "Category";

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-6 h-fit sticky top-20">
      {/* Price Filter */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="2000"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>৳0</span>
            <span className="font-medium text-orange-600">৳{filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Category / Sub-category Filter */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">{categoryTitle}</h3>
        <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
          {categoriesLoading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : visibleCategories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories found</p>
          ) : (
            visibleCategories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSlugs.includes(cat.slug)}
                  onChange={() => handleCategoryToggle(cat.slug)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => {
              const newFilters = { ...filters, inStock: e.target.checked };
              setFilters(newFilters);
              onFiltersChange?.(newFilters);
            }}
            className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-orange-500"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition text-sm"
      >
        Reset Filters
      </button>
    </div>
  );
}