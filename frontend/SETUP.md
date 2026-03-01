# 🔧 Setup & Development Guide

## System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (or yarn, pnpm)
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB for node_modules

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd "c:\Users\Lenovo\OneDrive\Desktop\BUETian's Boighor\frontend"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React
- ESLint

### 3. Start Development Server

```bash
npm run dev
```

Output:
```
  ▲ Next.js 14.1.6 (Turbopack)

  ✓ Ready in 2.1s

  ▶ Local:        http://localhost:3000
  ▶ Environments: .env, .env.local
```

### 4. Open in Browser

Visit: **http://localhost:3000**

## Available Scripts

### Development
```bash
npm run dev        # Start development server with hot reload
npm run dev:turbo  # Start with Turbopack (faster)
```

### Production Build
```bash
npm run build      # Create optimized production build
npm start          # Start production server
```

### Code Quality
```bash
npm run lint       # Run ESLint checker
npm run type-check # Run TypeScript checks
```

### Cleaning
```bash
npm run clean      # Remove .next and dist
```

## Environment Configuration

### Development Environment
- **Port**: 3000
- **Build Tool**: Turbopack (faster than Webpack)
- **Hot Reload**: Enabled
- **Source Maps**: Full

### Production Environment
- **Optimizations**: Applied
- **Code Splitting**: Enabled
- **Asset Compression**: Enabled
- **Bundle Analysis**: Available

## Project Structure Tips

### Adding a New Page
Create file at `app/my-page/page.tsx`:
```typescript
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Creating a New Component
Create file at `src/components/MyComponent.tsx`:
```typescript
"use client";

export default function MyComponent() {
  return <div>My Component</div>;
}
```

### Adding to Zustand Store
Edit `src/store/useCartStore.ts`:
```typescript
// Add new state property
newProp: SomeType;

// Add new action
setNewProp: (value: SomeType) => void;
```

## Common Development Tasks

### Debugging

1. **Browser DevTools**
   - Open: F12 or Ctrl+Shift+I
   - React DevTools extension recommended

2. **Console Logs**
   ```typescript
   console.log('Debug info:', variable);
   ```

3. **Breakpoints**
   - Set in browser DevTools
   - Pause execution for inspection

### Hot Module Replacement (HMR)

Changes to files are automatically detected and refreshed:
- Component changes: Instant refresh
- CSS changes: Instant refresh
- API changes: Full page reload

### TypeScript Errors

If you see TypeScript errors:
1. Check `tsconfig.json`
2. Verify import paths use `@/*` alias
3. Ensure types are imported correctly

```typescript
// ✅ Correct
import { Book } from '@/types';

// ❌ Incorrect
import { Book } from '../../../types';
```

## File Naming Conventions

- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Components**: `ComponentName.tsx` (PascalCase)
- **Utilities**: `utilityName.ts` (camelCase)
- **Stores**: `useStoreName.ts` (useXxx pattern)
- **Types**: `index.ts` in types folder

## Git Setup (Optional)

```bash
# Initialize git (already done)
git config user.name "Your Name"
git config user.email "your@email.com"

# Create commits
git add .
git commit -m "Feature: Add new component"

# View history
git log --oneline
```

## Deployment Preparation

### Before Deploying

1. **Run Build**
   ```bash
   npm run build
   ```

2. **Test Production Build**
   ```bash
   npm run build
   npm start
   ```

3. **Check Bundle Size**
   ```bash
   npm run analyze
   ```

4. **Environment Variables**
   Create `.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Deploy the .next folder
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Port Already in Use
```bash
# Change port
npm run dev -- -p 3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors After Changes
```bash
# Restart dev server
# Ctrl+C to stop
npm run dev
```

### Build Failures

1. Clear `.next` folder
   ```bash
   rm -rf .next
   ```

2. Run build again
   ```bash
   npm run build
   ```

3. Check for TypeScript errors
   ```bash
   npm run type-check
   ```

## Performance Optimization Tips

### Code Splitting
- Next.js automatically splits by route
- Dynamic imports for heavy components:
  ```typescript
  import dynamic from 'next/dynamic';
  const HeavyComponent = dynamic(() => import('.'));
  ```

### Image Optimization
- Use Next.js Image component:
  ```typescript
  import Image from 'next/image';
  <Image src="..." alt="..." width={500} height={500} />
  ```

### CSS Optimization
- Tailwind automatically purges unused CSS
- Custom CSS in globals.css

### Bundle Analysis
- Install analyzer: `npm install --save-dev @next/bundle-analyzer`
- Run: `npm run analyze`

## Database Integration (Future)

To add backend:

1. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. Create API utility:
   ```typescript
   // src/lib/api.ts
   const API_URL = process.env.NEXT_PUBLIC_API_URL;

   export async function fetchBooks() {
     const res = await fetch(`${API_URL}/books`);
     return res.json();
   }
   ```

3. Use in components:
   ```typescript
   import { fetchBooks } from '@/lib/api';

   export default async function Home() {
     const books = await fetchBooks();
     return <div>{/* ... */}</div>;
   }
   ```

## Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Docs](https://react.dev)

## Support & Help

If you encounter issues:

1. Check documentation files
2. Review browser console for errors
3. Check terminal for build errors
4. Read error messages carefully
5. Search GitHub issues for similar problems

---

**Happy developing! 🚀**
