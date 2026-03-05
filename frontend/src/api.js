import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In dev, fallback to localhost:8081
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

// Add a request interceptor to attach the token from localStorage
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
