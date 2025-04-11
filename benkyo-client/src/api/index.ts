import axios from 'axios';
import useAuthStore from '../hooks/stores/use-auth-store';
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

let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const { refreshToken, setToken, logout } = useAuthStore.getState();

        if (error.response.status === 401 && !originalRequest._retry && refreshToken) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const res = await api.post('/auth/refresh-token', { refreshToken });
                const newToken = res.data.token;
                setToken(newToken);
                api.defaults.headers.common.Authorization = newToken;
                processQueue(null, newToken);
                return api(originalRequest);
            } catch (error) {
                processQueue(error, null);
                logout();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
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
