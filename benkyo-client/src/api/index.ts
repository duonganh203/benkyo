import axios from 'axios';
import useAuthStore from '../hooks/useAuthStore';
const API_URL = import.meta.env.VITE_API_URL;
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

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const simplifiedError = {
                status: status,
                ...data
            };
            return Promise.reject(simplifiedError);
        }
        return Promise.reject(error);
    }
);
