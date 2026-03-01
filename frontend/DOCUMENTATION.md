# BUIBooks - E-Commerce Frontend

A production-ready, scalable e-commerce frontend for selling educational books, inspired by Rokomari.com and Amazon.com UI/UX patterns. Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

## 🎯 Project Overview

**BUIBooks** is a modern, responsive online bookstore frontend optimized for the Bangladesh market. It features:

- **Bold & Professional UI** - High-conversion focused design
- **Fully Responsive** - Mobile, tablet, and desktop optimized
- **Fast Performance** - Optimized with Next.js 14 & Turbopack
- **State Management** - Zustand-based cart functionality
- **Mock Data** - 25 demo books across 5+ categories
- **TypeScript** - Fully typed for type safety
- **Reusable Components** - Modular architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# Visit: http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global Tailwind styles
│   ├── category/
│   │   └── [category]/          # Dynamic category pages
│   │       └── page.tsx
│   ├── products/
│   │   └── [slug]/              # Dynamic product detail pages
│   │       └── page.tsx
│   ├── checkout/
│   │   └── page.tsx             # Cart checkout page
│   ├── login/
│   │   └── page.tsx             # Login page (demo)
│   ├── signup/
│   │   └── page.tsx             # Sign-up page (demo)
│   └── not-found.tsx            # 404 page
│
├── src/
│   ├── components/              # Reusable React components
│   │   ├── Navbar.tsx           # Navigation bar with search & cart
│   │   ├── HeroCarousel.tsx     # Hero section carousel
│   │   ├── BookCard.tsx         # Individual book card
│   │   ├── CategorySection.tsx  # Category section (5-book grid)
│   │   ├── FilterSidebar.tsx    # Left sidebar filters
│   │   ├── CartDrawer.tsx       # Sliding cart drawer
│   │   ├── Footer.tsx           # Footer component
│   │   ├── Breadcrumb.tsx       # Breadcrumb navigation
│   │   └── RatingStars.tsx      # Rating stars component
│   │
│   ├── store/
│   │   └── useCartStore.ts      # Zustand cart state management
│   │
│   ├── data/
│   │   └── demoBooks.ts         # 25 mock books (5 per category)
│   │
│   └── types/
│       └── index.ts             # TypeScript interfaces & types
│
├── public/                      # Static assets
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind configuration
├── next.config.ts              # Next.js config
└── README.md                   # This file
```

## 🎨 Design System

### Colors
- **Primary Orange**: `#FF6F00` (CTA, accents)
- **Dark Gray**: `#1F2937` (text, headings)
- **Light Gray**: `#F5F5F5` (backgrounds)
- **White**: `#FFFFFF` (cards, content)

### Spacing & Layout
- Clean padding with consistent gaps
- No overcrowding
- Clear section separation
- 5-column grid on desktop, 3 on tablet, 2 on mobile

### Components
- Rounded corners (`rounded-lg`)
- Default shadows (`shadow-sm`)
- Hover shadows (`shadow-lg`)
- Smooth transitions

## 📦 Features

### 🏠 Home Page
- **Hero Carousel** - Auto-sliding promotional banners
- **Trust Badges** - Stats about the business
- **Category Sections** - Grid displays for each category:
  - Admission Books
  - Engineering Books
  - Medical Books
  - HSC Books
  - Class 9-10 Books

### 📚 Category Pages
- **Dynamic Routing** - `/category/[category]`
- **Filter Sidebar** (Left)
  - Price range slider
  - Subject filtering
  - Publisher filtering
  - Stock availability toggle
- **Book Grid** - Responsive product grid
- **Breadcrumb Navigation** - Clear navigation path

### 🛍️ Product Detail Page
- **Image Gallery** - Book cover display
- **Quick Info** - Price, ratings, stock
- **Specifications** - Pages, publisher, ISBN, language
- **Quantity Controls** - Add to cart with quantity
- **Call-to-Action** - Add to cart, wishlist, share buttons
- **Benefits Section** - Free shipping, returns, security

### 🛒 Cart Management
- **Floating Cart Drawer** - Slide-in cart from right
- **Cart Operations** - Add, remove, update quantity
- **Real-time Badge** - Item count badge on navbar
- **Order Summary** - Subtotal, tax, shipping

### 💳 Checkout Page
- **Order Summary** - Full item list with prices
- **Shipping Address Form** - Full address collection
- **Cost Breakdown**
  - Subtotal
  - Tax (5%)
  - Shipping (free on ৳500+)
  - Total
- **Payment Methods** - COD, Card, Mobile Banking options

### 🔐 Auth Pages (Demo)
- **Login Page** - Email & password form
- **Sign-up Page** - Registration form with validation
- *Note: These are frontend-only demos, no backend authentication*

## 🧠 State Management (Zustand)

### Cart Store (`useCartStore`)

```typescript
interface CartStore {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
```

**Usage:**
```typescript
import { useCartStore } from '@/store/useCartStore';

const MyComponent = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  
  const handleAdd = () => addItem(book, 1);
};
```

## 📊 Mock Data

### Book Categories
- **Admission** (5 books) - HSC, Class 9-10, Engineering prep
- **Engineering** (5 books) - Civil, Electrical, Mechanical, Chemical
- **Medical** (5 books) - Anatomy, Physiology, Pathology, etc.
- **HSC** (5 books) - Physics, Chemistry, Biology, Math, English
- **Class 9-10** (5 books) - Science, Math, English books

### Book Data Structure
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  subCategory?: string;
  image: string;
  description: string;
  stock: number;
  specifications?: {
    pages?: number;
    publisher?: string;
    language?: string;
    isbn?: string;
  };
}
```

## 🎨 Key Components

### Navbar
- Sticky top navigation
- Search bar with category dropdown
- Cart icon with badge
- Login/Sign-up buttons
- Category mega menu
- Mobile hamburger menu

### Book Card
- Book image with hover zoom
- Discount badge
- Stock indicator
- Title (2-line clamp)
- Author name
- Rating & reviews
- Price display
- Add to cart button
- Hover shadow effect

### Filter Sidebar
- Price range slider
- Checkbox filters (Subject, Publisher)
- Stock availability toggle
- Reset filters button
- Sticky positioning

### Cart Drawer
- Slide-in from right
- Full cart item list
- Quantity controls
- Item removal
- Subtotal display
- Checkout button
- Continue shopping button

## 📱 Responsive Design

### Mobile (< 768px)
- 2-column book grid
- Hamburger menu
- Collapsible filters
- Full-width content
- Touch-friendly buttons

### Tablet (768px - 1024px)
- 3-column grid
- Visible category menu
- Left sidebar filters
- Optimized spacing

### Desktop (> 1024px)
- 5-column grid
- Full mega menu
- Sticky sidebar
- Optimal layout

## 🔧 Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 14 | React framework with App Router |
| **React** | 19 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | Latest | Styling |
| **Zustand** | Latest | State management |
| **Lucide Icons** | Latest | Beautiful icons |
| **Turbopack** | Built-in | Fast compilation |

## 🚀 Performance Optimizations

- ✅ Image optimization (next/image)
- ✅ Code splitting by route
- ✅ Lazy loading components
- ✅ CSS-in-JS with Tailwind
- ✅ TypeScript for bundle size reduction
- ✅ Turbopack for faster builds

## 📝 File Conventions

- **Page files** - `page.tsx` for routes
- **Layout files** - `layout.tsx`
- **Component files** - `ComponentName.tsx`
- **Store files** - `useStoreName.ts`
- **Type files** - `index.ts` in types folder
- **Data files** - `demoBooks.ts` in data folder

## 🎯 Usage Examples

### Adding a Book to Cart
```typescript
const { addItem } = useCartStore();

const handleAddToCart = (book: Book) => {
  addItem(book, 1); // Add 1 quantity
};
```

### Getting Cart Total
```typescript
const getTotalPrice = useCartStore((state) => state.getTotalPrice());
const total = getTotalPrice(); // Returns number
```

### Filtering Books
```typescript
const admissionBooks = demoBooks.filter(b => b.category === 'admission');
```

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Real user authentication
- [ ] Payment gateway integration
- [ ] Order management system
- [ ] User reviews & ratings
- [ ] Wishlist functionality
- [ ] Search functionality
- [ ] Admin panel
- [ ] Analytics & tracking
- [ ] Email notifications

## 📧 Contact & Support

- 📞 Phone: +880-1XXX-XXXXXX
- 📧 Email: support@buibooks.com
- 🌐 Website: https://buibooks.com

## 📄 License

This project is part of BUETian's Boighor initiative. All rights reserved.

---

**Built with ❤️ for educational excellence in Bangladesh**

Happy coding! 🚀
