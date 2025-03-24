import { api } from '.';

export const getUserProgress = async () => {
    const { data } = await api.get('/fsrs/progress');
    return data;
};
