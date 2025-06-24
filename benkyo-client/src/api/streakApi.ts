import { api } from '.';

export const loginStreak = async () => {
    const { data } = await api.post('/streak');
    return data;
};

export const getLoginStreak = async () => {
    const { data } = await api.get('/streak');
    return data;
};
