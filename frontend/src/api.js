import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In dev, fallback to localhost:8081
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

export default api;
