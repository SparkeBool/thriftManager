// src/api/axios.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL|| 'http://localhost:5000/api',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor (cookies are automatically included)
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent with requests when withCredentials: true
    // No need to manually add authorization headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Clear any client-side auth state if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;