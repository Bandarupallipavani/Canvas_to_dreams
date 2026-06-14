import axios from 'axios'
import { useAuthStore } from '../store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data),
}

// ── Products ──────────────────────────────────────────────
export const productsAPI = {
  list: (params) => api.get('/api/products', { params }),
  get: (slug) => api.get(`/api/products/${slug}`),
  categories: () => api.get('/api/products/categories'),
}

// ── Cart ──────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (product_id, quantity = 1) => api.post('/api/cart/add', { product_id, quantity }),
  remove: (item_id) => api.delete(`/api/cart/remove/${item_id}`),
  clear: () => api.delete('/api/cart/clear'),
}

// ── Orders ────────────────────────────────────────────────
export const ordersAPI = {
  checkout: (data) => api.post('/api/orders/checkout', data),
  verifyPayment: (data) => api.post('/api/orders/verify-payment', data),
  myOrders: () => api.get('/api/orders/my-orders'),
  get: (id) => api.get(`/api/orders/${id}`),
}

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  dashboard: () => api.get('/api/admin/dashboard'),
  // Products
  listProducts: () => api.get('/api/admin/products'),
  createProduct: (data) => api.post('/api/admin/products', data),
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
  toggleProduct: (id) => api.patch(`/api/admin/products/${id}/toggle`),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),
  // Orders
  listOrders: () => api.get('/api/admin/orders'),
  updateOrder: (id, data) => api.patch(`/api/admin/orders/${id}`, data),
  // Users
  listUsers: () => api.get('/api/admin/users'),
  // Upload
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (publicId) => api.delete(`/api/upload/image/${publicId}`),
}
