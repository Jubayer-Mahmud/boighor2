import apiClient from './axiosInstance';

export const adminService = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/admin/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/admin/profile');
    return response.data;
  },

  // Products
  getAllProducts: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/products?page=${page}&limit=${limit}`);
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    stock: number;
    image: string;
  }) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  updateProduct: async (
    id: string,
    productData: {
      title?: string;
      description?: string;
      price?: number;
      categoryId?: string;
      stock?: number;
      image?: string;
    }
  ) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // Categories (dedicated /api/categories endpoint)
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  createCategory: async (name: string, parentId?: string | null) => {
    const response = await apiClient.post('/categories', { name, parentId: parentId || null });
    return response.data;
  },

  updateCategory: async (id: string, name: string, parentId?: string | null) => {
    const response = await apiClient.put(`/categories/${id}`, { name, parentId: parentId || null });
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  // Orders
  getAllOrders: async (page = 1, limit = 20, status?: string) => {
    let query = `?page=${page}&limit=${limit}`;
    if (status) query += `&status=${status}`;
    const response = await apiClient.get(`/orders${query}`);
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Users
  getAllUsers: async (page = 1, limit = 10) => {
    // Note: This endpoint may not exist in the backend
    // We'll fetch users from the orders instead
    const response = await apiClient.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default adminService;
