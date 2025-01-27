import { api } from '.';
import { LoginPayload, RegisterPayload } from '../types/auth';

export const login = async (payload: LoginPayload) => {
    const { data } = await api.post('/login', payload);
    return data;
};

export const register = async (payload: RegisterPayload) => {
    await api.post('/register', payload);
};
