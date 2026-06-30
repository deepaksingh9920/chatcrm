import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const request = async (method, path, body = null) => {
  const token = await AsyncStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),

  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (data) => request('POST', '/auth/register', data),
  me: () => request('GET', '/auth/me'),

  // Dashboard
  dashboard: () => request('GET', '/dashboard'),

  // Search
  search: (q) => request('GET', `/search?q=${encodeURIComponent(q)}`),

  // Customers
  getCustomers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/customers?${qs}`);
  },
  getCustomer: (id) => request('GET', `/customers/${id}`),
  createCustomer: (data) => request('POST', '/customers', data),
  updateCustomer: (id, data) => request('PUT', `/customers/${id}`, data),
  archiveCustomer: (id) => request('DELETE', `/customers/${id}`),

  // Messages
  getMessages: (customerId) => request('GET', `/customers/${customerId}/messages`),
  sendMessage: (customerId, content) => request('POST', `/customers/${customerId}/messages`, { content, direction: 'OUT' }),

  // Quotes
  getQuotes: (customerId) => request('GET', `/customers/${customerId}/quotes`),
  createQuote: (customerId, data) => request('POST', `/customers/${customerId}/quotes`, data),
  updateQuote: (customerId, id, data) => request('PUT', `/customers/${customerId}/quotes/${id}`, data),
  convertQuote: (customerId, id) => request('POST', `/customers/${customerId}/quotes/${id}/convert`, {}),

  // Orders
  getOrders: (customerId) => request('GET', `/customers/${customerId}/orders`),
  updateOrder: (customerId, id, data) => request('PUT', `/customers/${customerId}/orders/${id}`, data),
  generateInvoice: (customerId, orderId) => request('POST', `/customers/${customerId}/orders/${orderId}/invoice`, {}),

  // Invoices
  getInvoices: (customerId) => request('GET', `/customers/${customerId}/invoices`),
  updateInvoice: (customerId, id, data) => request('PUT', `/customers/${customerId}/invoices/${id}`, data),

  // Tasks
  getTasks: (customerId) => request('GET', `/customers/${customerId}/tasks`),
  createTask: (customerId, data) => request('POST', `/customers/${customerId}/tasks`, data),
  updateTask: (customerId, id, data) => request('PUT', `/customers/${customerId}/tasks/${id}`, data),
  deleteTask: (customerId, id) => request('DELETE', `/customers/${customerId}/tasks/${id}`),

  // Notes
  getNotes: (customerId) => request('GET', `/customers/${customerId}/notes`),
  createNote: (customerId, content) => request('POST', `/customers/${customerId}/notes`, { content }),
  deleteNote: (customerId, id) => request('DELETE', `/customers/${customerId}/notes/${id}`),

  // Timeline
  getTimeline: (customerId) => request('GET', `/customers/${customerId}/timeline`),
};
