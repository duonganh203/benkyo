import { api } from '.';

export const studyStreak = async () => {
    const { data } = await api.patch('/streak/study');
    return data;
};

export const getStudyStreak = async () => {
    const { data } = await api.get('/streak/study');
    return data;
};

export const getTopLearningStreaks = async () => {
    const res = await api.get('/streak/study/top');
    return res.data.data;
};
