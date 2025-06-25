import { api } from '.';

export const studyStreak = async () => {
    const { data } = await api.post('/streak/study');
    return data;
};

export const getStudyStreak = async () => {
    const { data } = await api.get('/streak/study');
    return data;
};
