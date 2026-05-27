/**
 * Angkor Auto — Axios API Client
 * All API calls in the frontend should use this instance.
 */
import axios from 'axios';

const api = axios.create({
  // Prefer the injected VITE_API_URL (set at build time). Fall back to relative API path.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // token-based auth (Sanctum bearer token)
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
};

// ── Vehicles ──────────────────────────────────────────────────────────────
export const vehicleAPI = {
  list:            (params)   => api.get('/vehicles', { params }),
  get:             (id)       => api.get(`/vehicles/${id}`),
  create:          (data)     => api.post('/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:          (id, data) => api.post(`/vehicles/${id}?_method=PUT`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:          (id)       => api.delete(`/vehicles/${id}`),
  availability:    (id)       => api.get(`/vehicles/${id}/availability`),
  setAvailability: (id, data) => api.post(`/vehicles/${id}/availability`, data),
};

// ── Bookings ──────────────────────────────────────────────────────────────
export const bookingAPI = {
  list:         (params) => api.get('/bookings', { params }),
  get:          (id)     => api.get(`/bookings/${id}`),
  create:       (data)   => api.post('/bookings', data),
  updateStatus: (id, status, vehicleStatus) => api.put(`/bookings/${id}/status`, { status, vehicle_status: vehicleStatus }),
  delete:       (id)     => api.delete(`/bookings/${id}`),
  myBookings:   (params) => api.get('/my-bookings', { params }),
};

// ── Rentals ───────────────────────────────────────────────────────────────
export const rentalAPI = {
  list:   (params) => api.get('/rentals', { params }),
  get:    (id)     => api.get(`/rentals/${id}`),
  create: (data)   => api.post('/rentals', data),
  update: (id, data) => api.put(`/rentals/${id}`, data),
};

// ── Customers ─────────────────────────────────────────────────────────────
export const customerAPI = {
  list:             (params) => api.get('/customers', { params }),
  get:              (id)     => api.get(`/customers/${id}`),
  update:           (id, data) => api.put(`/customers/${id}`, data),
  myProfile:        ()       => api.get('/my-profile'),
  uploadMyDocument: (data)   => api.post(`/my-documents`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocument:   (id, data) => api.post(`/customers/${id}/documents`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDocuments:     (id)     => api.get(`/customers/${id}/documents`),
  delete:           (id)     => api.delete(`/customers/${id}`),
};

// ── Addons ────────────────────────────────────────────────────────────────
export const addonAPI = {
  list:   ()         => api.get('/addons'),
  create: (data)     => api.post('/addons', data),
  update: (id, data) => api.put(`/addons/${id}`, data),
  delete: (id)       => api.delete(`/addons/${id}`),
};

// ── Invoices ──────────────────────────────────────────────────────────────
export const invoiceAPI = {
  get:    (id)       => api.get(`/invoices/${id}`),
  create: (data)     => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id)       => api.delete(`/invoices/${id}`),
};

// ── Payments ──────────────────────────────────────────────────────────────
export const paymentAPI = {
  list:          (params) => api.get('/payments', { params }),
  store:         (data)   => api.post('/payments', data),
  createIntent:  (data)   => api.post('/payment/create-intent', data),
};

// ── Returns ───────────────────────────────────────────────────────────────
export const returnAPI = {
  create: (data)     => api.post('/returns', data),
  get:    (id)       => api.get(`/returns/${id}`),
  update: (id, data) => api.put(`/returns/${id}`, data),
};

// ── Maintenance ───────────────────────────────────────────────────────────
export const maintenanceAPI = {
  list:   (params)   => api.get('/maintenance', { params }),
  create: (data)     => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id)       => api.delete(`/maintenance/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationAPI = {
  list:        (params) => api.get('/notifications', { params }),
  unreadCount: ()       => api.get('/notifications/unread-count'),
  markRead:    (id)     => api.put(`/notifications/${id}/read`),
  markAllRead: ()       => api.put('/notifications/read-all'),
};

// ── Users (admin) ─────────────────────────────────────────────────────────
export const userAPI = {
  list:   (params)   => api.get('/users', { params }),
  get:    (id)       => api.get(`/users/${id}`),
  create: (data)     => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id)       => api.delete(`/users/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats:    () => api.get('/dashboard/stats'),
  mailLogs: () => api.get('/dashboard/mail-logs'),
};

// ── Revenue ───────────────────────────────────────────────────────────────
export const revenueAPI = {
  stats:  (params) => api.get('/revenue/stats', { params }),
  updateTarget: (data) => api.post('/revenue/targets', data),
};

export default api;
