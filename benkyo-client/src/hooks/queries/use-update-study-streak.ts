import { studyStreak } from '@/api/streakApi';
import { ApiError } from '@/types/api';
import { StudyStreakResponse } from '@/types/streak';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useUpdateStudyStreak = () => {
    return useMutation<StudyStreakResponse, AxiosError<ApiError>>({
        mutationFn: () => studyStreak(),
        mutationKey: ['studyStreak']
    });
};

export default useUpdateStudyStreak;
