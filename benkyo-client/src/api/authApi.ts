import { api } from '.';
import { LoginPayload, RegisterPayload, ChangePasswordPayload } from '../types/auth';

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
export const changePassword = async (payload: ChangePasswordPayload) => {
    const { data } = await api.post('auth/changePassword', payload);
    return data;
};
