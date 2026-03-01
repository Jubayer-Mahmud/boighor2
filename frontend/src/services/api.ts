// Frontend API Service - Place this in frontend/src/services/api.ts or api.js
// This file integrates the frontend with the backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
interface FilterParams {
  category?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
  status?: string;
}

interface UserData {
  name?: string;
  email?: string;
  password?: string;
}

interface ProfileData {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

interface ProductData {
  title: string;
  description: string;
  price: number | string;
  category: string;
  stock?: number | string;
  image: string;
}

interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

// Helper function to make API requests
const apiCall = async (
  endpoint: string,
  method: string = 'GET',
  body: unknown = null,
  requiresAuth: boolean = false
): Promise<any> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization token if required
  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('No authentication token found. Please login.');
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// ============================================
// USER AUTHENTICATION & PROFILE
// ============================================

export const userAPI = {
  // Register new user
  register: async (userData: UserData): Promise<any> => {
    return apiCall('/users/register', 'POST', userData);
  },

  // Login user
  login: async (email: string, password: string): Promise<any> => {
    return apiCall('/users/login', 'POST', { email, password });
  },

  // Get user profile
  getProfile: async (): Promise<any> => {
    return apiCall('/users/profile', 'GET', null, true);
  },

  // Update user profile
  updateProfile: async (profileData: ProfileData): Promise<any> => {
    return apiCall('/users/profile', 'PUT', profileData, true);
  },
};

// ============================================
// ADMIN AUTHENTICATION
// ============================================

export const adminAPI = {
  // Register admin
  register: async (adminData: UserData): Promise<any> => {
    return apiCall('/admin/register', 'POST', adminData);
  },

  // Login admin
  login: async (email: string, password: string): Promise<any> => {
    return apiCall('/admin/login', 'POST', { email, password });
  },

  // Get admin profile
  getProfile: async (): Promise<any> => {
    return apiCall('/admin/profile', 'GET', null, true);
  },
};

// ============================================
// PRODUCTS
// ============================================

export const productAPI = {
  // Get all products with filters
  getAll: async (filters: FilterParams = {}): Promise<any> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', String(filters.category));
    if (filters.search) params.append('search', String(filters.search));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/products${query}`);
  },

  // Get product by ID
  getById: async (id: string): Promise<any> => {
    return apiCall(`/products/${id}`);
  },

  // Get all categories
  getCategories: async (): Promise<any> => {
    return apiCall('/products/categories');
  },

  // Create product (admin only)
  create: async (productData: ProductData): Promise<any> => {
    return apiCall('/products', 'POST', productData, true);
  },

  // Update product (admin only)
  update: async (id: string, productData: Partial<ProductData>): Promise<any> => {
    return apiCall(`/products/${id}`, 'PUT', productData, true);
  },

  // Delete product (admin only)
  delete: async (id: string): Promise<any> => {
    return apiCall(`/products/${id}`, 'DELETE', null, true);
  },
};

// ============================================
// CART
// ============================================

export const cartAPI = {
  // Get user's cart
  get: async (): Promise<any> => {
    return apiCall('/cart', 'GET', null, true);
  },

  // Add item to cart
  addItem: async (productId: string, quantity: number): Promise<any> => {
    return apiCall('/cart', 'POST', { productId, quantity }, true);
  },

  // Update cart item quantity
  updateItem: async (productId: string, quantity: number): Promise<any> => {
    return apiCall('/cart', 'PUT', { productId, quantity }, true);
  },

  // Remove item from cart
  removeItem: async (productId: string): Promise<any> => {
    return apiCall(`/cart/${productId}`, 'DELETE', null, true);
  },

  // Clear entire cart
  clear: async (): Promise<any> => {
    return apiCall('/cart', 'DELETE', null, true);
  },
};

// ============================================
// ORDERS
// ============================================

export const orderAPI = {
  // Create new order
  create: async (shippingDetails: ShippingDetails): Promise<any> => {
    return apiCall('/orders', 'POST', { shippingDetails }, true);
  },

  // Get user's orders
  getUserOrders: async (): Promise<any> => {
    return apiCall('/orders/user/orders', 'GET', null, true);
  },

  // Get single order
  getById: async (id: string): Promise<any> => {
    return apiCall(`/orders/${id}`, 'GET', null, true);
  },

  // Get all orders (admin only)
  getAll: async (filters: FilterParams = {}): Promise<any> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', String(filters.status));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/orders${query}`, 'GET', null, true);
  },

  // Update order status (admin only)
  updateStatus: async (id: string, status: string): Promise<any> => {
    return apiCall(`/orders/${id}/status`, 'PUT', { status }, true);
  },
};

// ============================================
// TOKEN MANAGEMENT
// ============================================

export const tokenAPI = {
  // Store token from login response
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Remove token (logout)
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

export default {
  userAPI,
  adminAPI,
  productAPI,
  cartAPI,
  orderAPI,
  tokenAPI,
};
