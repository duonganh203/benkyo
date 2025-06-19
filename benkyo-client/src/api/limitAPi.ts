import { api } from '.';

export const getCreditAI = async (func: string) => {
    const response = await api.get('limit/Ai');
    return response.data as number;
};
