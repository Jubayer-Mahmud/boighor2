# 🚀 Quick Start Guide

Get the BUIBooks frontend running in 5 minutes!

## Step 1: Terminal Setup

Open PowerShell and navigate to the project:

```powershell
cd "C:\Users\Lenovo\OneDrive\Desktop\BUETian's Boighor\frontend"
```

## Step 2: Start the Development Server

```powershell
npm run dev
```

You should see:
```
  ▲ Next.js 14.1.6 (Turbopack)
  
  ✓ Ready in 2.1s
  
  ▶ Local:        http://localhost:3000
```

## Step 3: Open in Browser

Click or copy-paste: **http://localhost:3000**

## Step 4: Explore the Site

### 🏠 Home Page
- See hero carousel auto-scrolling
- Browse all book categories
- Click on any book card

### 📚 Category Page
- Click "View All" on any category
- Use filters on left sidebar
- See books update in real-time

### 🛍️ Product Detail Page
- Click on any book card to see full details
- Add to cart with quantity control
- See specifications and reviews

### 🛒 Shopping Cart
- Click cart icon in navbar
- Add/remove books
- See subtotal update instantly

### 💳 Checkout
- Click "Proceed to Checkout"
- Fill in shipping address
- See cost breakdown
- Choose payment method

## Basic Operations

### Add a Book to Cart
1. Click on any book card
2. Increase quantity if needed
3. Click "Add to Cart"
4. Cart badge updates instantly

### Change Cart Items
1. Click cart icon to open drawer
2. Use +/- buttons to change quantity
3. Click X to remove item
4. See total update in real-time

### Navigate Categories
- Use top menu bar to switch categories
- Or click "View All" on any section
- Apply filters to narrow results

### Go Back Home
- Click logo (📚 BUIBooks)
- Or use browser back button

## Key URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Admission | http://localhost:3000/category/admission |
| Engineering | http://localhost:3000/category/engineering |
| Medical | http://localhost:3000/category/medical |
| HSC | http://localhost:3000/category/hsc |
| Class 9-10 | http://localhost:3000/category/class-9-10 |
| Checkout | http://localhost:3000/checkout |
| Login | http://localhost:3000/login |
| Sign Up | http://localhost:3000/signup |

## Available Test Credentials

**Login Page (Demo)**
- Email: any@email.com
- Password: any password

**All filters work** - Try applying them!

## Hot Reload

The dev server automatically refreshes when you:
- Edit component files
- Change stylesheets
- Modify mock data
- Update store logic

Just save the file and the page reloads!

## Stop the Server

Press: **Ctrl + C** in terminal

## Troubleshooting

### Page Takes Too Long to Load
- Wait a bit longer first time
- Check network in DevTools (F12)
- Check browser console for errors

### Cart Doesn't Update
- Check browser console (F12)
- Refresh the page
- Try adding item again

### Styling Looks Wrong
- Hard refresh: Ctrl + Shift + R
- Clear browser cache
- Check DevTools for CSS errors

### Dev Server Won't Start
```powershell
# Kill any process on port 3000
Get-Process node | Stop-Process -Force

# Try starting again
npm run dev
```

## Making Changes

### Change Home Page
Edit: `app/page.tsx`
- Modify categories
- Add new sections
- Change layout

### Change Book Data
Edit: `src/data/demoBooks.ts`
- Add new books
- Change prices
- Update descriptions

### Modify Colors
Edit: `app/globals.css` or specific components
- Primary color: #FF6F00 (orange)
- Search & replace to change everywhere

### Add New Page
Create: `app/my-page/page.tsx`
```typescript
export default function MyPage() {
  return <div>My Page</div>;
}
```

Access at: `http://localhost:3000/my-page`

## Browser Developer Tools

Open: **F12** or **Ctrl + Shift + I**

### Useful Tabs
- **Console**: See errors and logs
- **Network**: Check requests
- **Application**: View localStorage
- **Elements**: Inspect HTML/CSS

### React DevTools (Recommended)
- Install Chrome extension: "React Developer Tools"
- Inspect component props and state
- See rendering performance

## Performance Testing

### Check Page Speed
1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload page
4. Check "XHR" requests and load times

### Check Bundle Size
```powershell
npm run build
```
See optimized bundle in `.next/static`

## Database Integration (Future)

To connect backend API:

1. Create `.env.local` file
2. Add: `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. Modify data fetching in pages

Example:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books`);
const books = await response.json();
```

## Next Steps

1. ✅ Explore all pages
2. ✅ Test all features
3. ✅ Read documentation files
4. ✅ Review component guide
5. ✅ Plan backend integration
6. ✅ Deploy to production

## Documentation Files

- **DOCUMENTATION.md** - Full project overview & structure
- **FEATURES.md** - Complete feature list
- **COMPONENTS.md** - Component API reference
- **SETUP.md** - Development & deployment guide

## Getting Help

1. Check documentation files
2. Look at component examples in `app/`
3. Search Google for errors
4. Check Next.js/React documentation
5. Review code comments

## Key Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **F12** | Open DevTools |
| **Ctrl + Shift + R** | Hard refresh |
| **Ctrl + C** | Stop dev server |
| **Ctrl + K** | Focus search |

## Production Deployment

When ready for production:

```powershell
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
npm install -g vercel
vercel
```

---

**Enjoy building! Questions? Check the docs! 🎉**
