import { api } from '.';

export const getCreditAI = async (functionType: string) => {
    const response = await api.get(`limit/${functionType}`);
    return response.data.remainingCredits as number;
};
