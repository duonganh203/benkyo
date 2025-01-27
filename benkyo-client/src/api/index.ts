import axios from 'axios';
import useAuthStore from '../hooks/useAuthStore';
const API_URL = import.meta.env.API_URL;
export const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});
