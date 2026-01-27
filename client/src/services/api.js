import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = (params = {}) => 
  api.get('/products', { params });

export const getProductById = (id) => 
  api.get(`/products/${id}`);

export const getProductsByCategory = (category, params = {}) => 
  api.get(`/products/category/${category}`, { params });

export const searchProducts = (query, params = {}) => 
  api.get(`/products/search/${query}`, { params });

// Orders
export const createOrder = (orderData) => 
  api.post('/orders', orderData);

export const getOrderByNumber = (orderNumber, email) => 
  api.get(`/orders/${orderNumber}`, { params: { email } });

// Payment
export const createStripeCheckout = (orderId) => 
  api.post('/payment/stripe/create-checkout-session', { orderId });

export const createPayPalOrder = (orderId) => 
  api.post('/payment/paypal/create-order', { orderId });

export const capturePayPalOrder = (paypalOrderId) => 
  api.post('/payment/paypal/capture-order', { paypalOrderId });

// Downloads
export const getDownload = (token) => 
  api.get(`/downloads/${token}`);

export const verifyDownloadToken = (token) => 
  api.get(`/downloads/${token}/verify`);

export default api;
