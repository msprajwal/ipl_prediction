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

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Skip auto-logout for login/register endpoints
            const url = error.config?.url || '';
            if (!url.includes('/login') && !url.includes('/register')) {
                localStorage.removeItem('token');
                // Use dynamic import to avoid circular dependency
                import('js-cookie').then((Cookies) => {
                    Cookies.default.remove('user');
                });
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
