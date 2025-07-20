import axios from 'axios';

// Get API base URL based on environment
const getApiUrl = () => {
  // Development - always use localhost
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const url = 'http://localhost:5000';
    console.log('🌐 API URL (development):', url);
    return url;
  }
  
  // Check for environment variable first
  if (process.env.REACT_APP_API_URL) {
    console.log('🌐 API URL from env:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Check for Vercel environment variable
  if (process.env.REACT_APP_BACKEND_URL) {
    console.log('🌐 API URL from Vercel env:', process.env.REACT_APP_BACKEND_URL);
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Production fallback
  const url = 'https://recipe-share-franc-dev3574-ol7mikw4.leapcell.dev';
  console.log('🌐 API URL (production):', url);
  return url;
};

// Create simple axios instance - NO TIMEOUTS
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making request to:', config.method?.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Simple response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.message);
    return Promise.reject(error);
  }
);

export default api; 