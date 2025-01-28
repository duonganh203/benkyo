import { api } from '.';
import { LoginPayload, RegisterPayload } from '../types/auth';

export const login = async (payload: LoginPayload) => {
    const { data } = await api.post('auth/login', payload);
    return data;
};

export const register = async (payload: RegisterPayload) => {
    await api.post('auth/register', payload);
};

export const me = async () => {
    const { data } = await api.get('auth/me');
    return data;
};
