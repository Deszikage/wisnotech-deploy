import axios from 'axios';

// 1. Hardcode the backend URL directly (No environment variables for now)
const API_URL = 'https://wisnotech-deploy.onrender.com';
const API = `${API_URL}/api`; 

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wisnotech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { API_URL, API };
export default api;
