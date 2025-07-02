import { studyStreak } from '@/api/streakApi';
import { ApiError } from '@/types/api';
import { StudyStreakResponse } from '@/types/steak';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useStudyStreak = () => {
    return useMutation<StudyStreakResponse, AxiosError<ApiError>>({
        mutationFn: () => studyStreak(),
        mutationKey: ['studyStreak']
    });
};

export default useStudyStreak;
