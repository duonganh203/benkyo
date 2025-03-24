import { updateUserPayload } from '@/types/user';
import { api } from '.';

export const updateUser = async (userData: updateUserPayload) => {
    const { data } = await api.patch('/user/update', userData);
    return data;
};
