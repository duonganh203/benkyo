import { ClassUserRequestDto } from '@/types/class';
import { api } from '.';

export const createClassApi = async (data: ClassUserRequestDto) => {
    const response = await api.post('/class/create', data);
    return response.data;
};
