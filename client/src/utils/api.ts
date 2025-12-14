import axios from 'axios';

// Eğer sistemde tanımlı özel bir adres varsa (Render) onu kullan.
// Yoksa varsayılan olarak localhost'u kullan.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: baseURL,
});

// Her istekte Token'ı header'a ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;