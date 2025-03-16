import { api } from '.';
import { updateUserPayload } from '@/types/user';

export const updateUser = async (userData: updateUserPayload) => {
    const { data } = await api.patch('user', userData);
    return data;
};
