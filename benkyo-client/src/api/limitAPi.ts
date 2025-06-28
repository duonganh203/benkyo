import { api } from '.';

export const getCreditAI = async () => {
    const response = await api.get('limit/Ai');
    return response.data.remainingCredits as number;
};
