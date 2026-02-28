import axios from 'axios';

// In production (when served by Go backend via ngrok), use empty string so it hits the same domain automatically.
// In dev, use the VITE_API_URL or fallback to localhost:8081
const baseURL = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || 'http://localhost:8081');

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

export default api;
