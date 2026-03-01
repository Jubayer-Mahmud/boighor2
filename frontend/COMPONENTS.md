# 🧩 Component Guide

Complete guide to all components in the BUIBooks application.

## Table of Contents
1. [Layout Components](#layout-components)
2. [Product Components](#product-components)
3. [Cart Components](#cart-components)
4. [Navigation Components](#navigation-components)
5. [Utility Components](#utility-components)
6. [Usage Examples](#usage-examples)

---

## Layout Components

### Navbar

**File**: `src/components/Navbar.tsx`

Main navigation bar with search, categories, and cart.

**Features**:
- Sticky positioning
- Search bar with category dropdown
- Shopping cart badge
- Login/Signup buttons
- Mobile hamburger menu
- Responsive design

**Props**: None (uses hooks internally)

**Usage**:
```typescript
import Navbar from '@/components/Navbar';

export default function Layout() {
  return <Navbar />;
}
```

**Customization**:
- Modify search placeholder
- Change primary color (#FF6F00 to something else)
- Add/remove categories

---

### Footer

**File**: `src/components/Footer.tsx`

Application footer with links and information.

**Features**:
- Multiple columns of links
- Social media icons
- Contact information
- Company info
- Responsive grid

**Props**: None

**Usage**:
```typescript
import Footer from '@/components/Footer';

export default function Layout() {
  return <Footer />;
}
```

---

## Product Components

### BookCard

**File**: `src/components/BookCard.tsx`

Individual book product card for grid displays.

**Features**:
- Book image with hover zoom
- Discount badge
- Stock indicator
- Title (2-line clamp)
- Author name
- Star ratings
- Price display (regular + discount)
- Add to cart button

**Props**:
```typescript
interface BookCardProps {
  book: Book;
}
```

**Usage**:
```typescript
import BookCard from '@/components/BookCard';

function ProductGrid() {
  return (
    <div className="grid grid-cols-3">
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

**Styling**:
- `rounded-lg` for corners
- `shadow-sm` default, `shadow-lg` on hover
- `gap-3 md:gap-4` spacing

---

### CategorySection

**File**: `src/components/CategorySection.tsx`

Displays a section of books for a category.

**Features**:
- Section title
- "View All" button
- 5-column responsive grid
- Automatic book limiting

**Props**:
```typescript
interface CategorySectionProps {
  title: string;           // Section heading
  books: Book[];           // Array of books
  categorySlug: string;    // URL slug for View All link
  isScrollable?: boolean;  // Optional: enable horizontal scroll
}
```

**Usage**:
```typescript
import CategorySection from '@/components/CategorySection';

function Home() {
  const admissionBooks = books.filter(b => b.category === 'admission');
  
  return (
    <CategorySection
      title="Admission Books"
      books={admissionBooks}
      categorySlug="admission"
    />
  );
}
```

---

### RatingStars

**File**: `src/components/RatingStars.tsx`

Displays star rating with optional text.

**Features**:
- Filled and empty stars
- Customizable size
- Optional rating text
- Gold/gray colors

**Props**:
```typescript
interface RatingStarsProps {
  rating: number;      // 0-5
  size?: number;       // Icon size in pixels (default: 16)
  showText?: boolean;  // Show rating number (default: true)
}
```

**Usage**:
```typescript
import RatingStars from '@/components/RatingStars';

// With text
<RatingStars rating={4.5} size={20} showText={true} />

// Without text
<RatingStars rating={3} size={16} showText={false} />
```

---

### FilterSidebar

**File**: `src/components/FilterSidebar.tsx`

Left sidebar filter panel for category pages.

**Features**:
- Price range slider
- Subject checkboxes
- Publisher checkboxes
- Stock availability toggle
- Reset filters button
- Sticky positioning

**Props**:
```typescript
interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  priceRange: [number, number];
  subjects: string[];
  publishers: string[];
  inStock: boolean;
}
```

**Usage**:
```typescript
import FilterSidebar from '@/components/FilterSidebar';
import { FilterState } from '@/components/FilterSidebar';

function CategoryPage() {
  const [filters, setFilters] = useState<FilterState>({...});

  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Apply filters to books
  };

  return (
    <FilterSidebar onFiltersChange={handleFilter} />
  );
}
```

---

## Cart Components

### CartDrawer

**File**: `src/components/CartDrawer.tsx`

Sliding cart drawer from right side.

**Features**:
- Slide-in animation
- Full item list with images
- Quantity controls
- Remove buttons
- Subtotal calculation
- Checkout button
- Continue shopping button
- Empty state

**Props**:
```typescript
interface CartDrawerProps {
  isOpen: boolean;           // Control visibility
  onClose: () => void;       // Close callback
}
```

**Usage**:
```typescript
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/store/useCartStore';

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Cart
      </button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

---

## Navigation Components

### Breadcrumb

**File**: `src/components/Breadcrumb.tsx`

Breadcrumb navigation showing current path.

**Features**:
- Auto-adds home link
- Clickable links
- Chevron separators
- Last item bold

**Props**:
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
```

**Usage**:
```typescript
import Breadcrumb from '@/components/Breadcrumb';

function ProductPage() {
  return (
    <Breadcrumb 
      items={[
        { label: 'Products', href: '/' },
        { label: 'Book Title' }
      ]}
    />
  );
}
```

---

### HeroCarousel

**File**: `src/components/HeroCarousel.tsx`

Auto-sliding carousel with promotional banners.

**Features**:
- Auto slide every 5 seconds
- Manual previous/next buttons
- Dot navigation
- Responsive height
- Gradient backgrounds

**Props**: None (uses internal state)

**Usage**:
```typescript
import HeroCarousel from '@/components/HeroCarousel';

export default function Home() {
  return (
    <section className="py-8">
      <HeroCarousel />
    </section>
  );
}
```

**Customization**:
- Edit banner content in `banners` array
- Change slide interval (currently 5000ms)
- Modify colors

---

## Utility Components

### State Management (Zustand)

**File**: `src/store/useCartStore.ts`

Global cart state management.

**Store Methods**:
```typescript
// Usage in component
import { useCartStore } from '@/store/useCartStore';

function MyComponent() {
  // Get state
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  
  // Get actions
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Use them
  const handleAdd = () => addItem(book, 1);
  const handleRemove = () => removeItem(bookId);
  const handleUpdate = () => updateQuantity(bookId, 5);
}
```

**Available Actions**:
- `addItem(book, quantity?)` - Add to cart
- `removeItem(id)` - Remove from cart
- `updateQuantity(id, quantity)` - Change quantity
- `clearCart()` - Empty entire cart
- `getTotalPrice()` - Calculate total
- `getTotalItems()` - Count items

---

## Usage Examples

### Complete Category Page Example

```typescript
"use client";

import { useState } from 'react';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import BookCard from '@/components/BookCard';
import Breadcrumb from '@/components/Breadcrumb';
import { demoBooks } from '@/data/demoBooks';

export default function CategoryPage() {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    subjects: [],
    publishers: [],
    inStock: false,
  });

  const category = 'admission'; // From route params
  const books = demoBooks.filter(b => b.category === category);

  const filteredBooks = books.filter(book => {
    const price = book.discountPrice || book.price;
    return price >= filters.priceRange[0] && price <= filters.priceRange[1];
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Admission Books' }]} />
      
      <div className="grid grid-cols-4 gap-6">
        <aside>
          <FilterSidebar onFiltersChange={setFilters} />
        </aside>
        
        <div className="col-span-3">
          <div className="grid grid-cols-3 gap-4">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
```

### Add to Cart Example

```typescript
"use client";

import { useCartStore } from '@/store/useCartStore';
import { Book } from '@/types';

function ProductActions({ book }: { book: Book }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const handleAdd = () => {
    addItem(book, quantity);
    setQuantity(1);
    alert('Added to cart!');
  };

  return (
    <div>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={e => setQuantity(Number(e.target.value))}
      />
      <button onClick={handleAdd}>
        Add to Cart
      </button>
    </div>
  );
}
```

### Display Cart Total

```typescript
"use client";

import { useCartStore } from '@/store/useCartStore';

function CartSummary() {
  const getTotalPrice = useCartStore(state => state.getTotalPrice());
  const getTotalItems = useCartStore(state => state.getTotalItems());

  return (
    <div className="bg-white p-6 rounded-lg">
      <p>Items: {getTotalItems()}</p>
      <p className="text-2xl font-bold">
        Total: ৳{getTotalPrice()}
      </p>
    </div>
  );
}
```

---

## Component Hierarchy

```
App
├── Navbar
│   ├── Search
│   ├── CartDrawer
│   │   └── CartItems
│   └── AuthButtons
├── Main Page/Layout
│   ├── HeroCarousel
│   ├── CategorySection
│   │   └── BookCard (x5)
│   ├── CategorySection
│   └── ...
└── Footer
```

---

## Best Practices

1. **Use "use client"** for interactive components
2. **Memoize callbacks** to prevent unnecessary re-renders
3. **Keep components focused** - single responsibility
4. **Use TypeScript** for type safety
5. **Pass minimal props** - use context/zustand for shared state
6. **Handle loading states** in data-dependent components
7. **Test responsiveness** across breakpoints

---

**For more examples, check the `/app` directory!**
