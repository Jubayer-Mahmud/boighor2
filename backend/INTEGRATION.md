# Backend & Frontend Integration Guide

## Overview

This guide shows how to connect your Next.js frontend with the production-ready Node.js/Express backend.

## Backend Location

All backend files are in the `backend/` folder at the project root.

## Frontend API Service

A pre-built API service is available at `frontend/src/services/api.ts`. It provides type-safe methods for all backend endpoints.

## Quick Integration

### 1. Configure API URL

In `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Or in `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

### 2. Start Both Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm install
npm run dev      # Runs on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev      # Runs on http://localhost:3000
```

## Usage Examples

### User Registration

```typescript
import { userAPI, tokenAPI } from '@/services/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const response = await userAPI.register({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      });

      // Save token
      tokenAPI.setToken(response.token);

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input name="name" type="text" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### User Login

```typescript
import { userAPI, tokenAPI } from '@/services/api';

export default function LoginPage() {
  const handleLogin = async (email, password) => {
    try {
      const response = await userAPI.login(email, password);
      tokenAPI.setToken(response.token);
      // Redirect to home
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Form JSX
  );
}
```

### Get Products

```typescript
import { productAPI } from '@/services/api';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll({
          category: 'fiction',
          page: 1,
          limit: 10,
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="border p-4 rounded">
          <img src={product.image} alt={product.title} />
          <h3>{product.title}</h3>
          <p>৳{product.price}</p>
          <button onClick={() => addToCart(product._id)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
```

### Add to Cart

```typescript
import { cartAPI } from '@/services/api';

const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await cartAPI.addItem(productId, quantity);
    // Show success message
    alert('Added to cart!');
  } catch (error) {
    if (error.message.includes('No authentication token')) {
      // Redirect to login
      router.push('/login');
    } else {
      alert(error.message);
    }
  }
};
```

### Create Custom Hook for Auth

```typescript
// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { tokenAPI, userAPI } from '@/services/api';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists
    if (tokenAPI.isAuthenticated()) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Token invalid, logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenAPI.removeToken();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return { user, loading, isAuthenticated, logout };
};
```

### Use in Component

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

### Create Order

```typescript
import { cartAPI, orderAPI } from '@/services/api';

const handleCheckout = async (formData) => {
  try {
    const shippingDetails = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
    };

    const response = await orderAPI.create(shippingDetails);
    
    // Clear cart after order
    await cartAPI.clear();
    
    // Redirect to order confirmation
    router.push(`/order-confirmation/${response.order._id}`);
  } catch (error) {
    alert(error.message);
  }
};
```

### Admin - Create Product

```typescript
import { productAPI } from '@/services/api';

const handleCreateProduct = async (formData) => {
  try {
    const response = await productAPI.create({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      image: formData.imageUrl,
    });

    alert('Product created successfully!');
    // Refresh products list
  } catch (error) {
    alert(error.message);
  }
};
```

## Store Integration (Zustand/Redux)

### Example with Zustand

```typescript
// frontend/src/store/useStore.ts
import { create } from 'zustand';
import { userAPI, cartAPI, tokenAPI } from '@/services/api';

interface StoreState {
  user: any | null;
  cart: any | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  cart: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await userAPI.login(email, password);
    tokenAPI.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    tokenAPI.removeToken();
    set({ user: null, isAuthenticated: false, cart: null });
  },

  fetchCart: async () => {
    const response = await cartAPI.get();
    set({ cart: response.cart });
  },

  addToCart: async (productId, quantity) => {
    await cartAPI.addItem(productId, quantity);
    // Refresh cart
    const cart = await cartAPI.get();
    set({ cart: cart.cart });
  },
}));
```

## Error Handling

```typescript
try {
  const response = await productAPI.getAll();
} catch (error) {
  if (error.message.includes('No token')) {
    // Redirect to login
    router.push('/login');
  } else if (error.message.includes('unauthorized')) {
    // Handle unauthorized
  } else {
    // Handle other errors
    console.error(error);
  }
}
```

## Authentication Flow

1. User signs up/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for all protected requests
5. Backend validates token
6. If invalid/expired, frontend gets 401 error
7. Redirect to login

## Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** (`.env`):
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:3000
```

## Troubleshooting

### CORS Error
- Check `CORS_ORIGIN` in backend `.env` matches frontend domain
- Should be `http://localhost:3000` for development

### 401 Token Error
- Token not being sent properly
- Token expired (default 7 days)
- JWT_SECRET mismatch

### MongooseError
- MongoDB not connected
- Check MONGODB_URI
- Check network connectivity

## Testing

Use Postman or Thunder Client to test API before integrating:

1. Register user: `POST /api/users/register`
2. Get products: `GET /api/products`
3. Create product: `POST /api/products` (with admin token)
4. Create order: `POST /api/orders` (with user token)

## Production Deployment

### Backend (Heroku, Railway, Render)

```bash
# Push to git
git add .
git commit -m "Backend ready"
git push heroku main

# Connect MongoDB Atlas
# Set environment variables on hosting platform
```

### Frontend (Vercel, Netlify)

```bash
# Update API URL in .env
NEXT_PUBLIC_API_URL=https://backend-api.com/api

# Deploy
npm run build
# Deploy to Vercel/Netlify
```

## API Reference

See `backend/README.md` for complete API documentation.

## Support

For issues:
1. Check server logs
2. Test with Postman
3. Check browser console
4. Review CORS settings
5. Verify tokens are being sent
