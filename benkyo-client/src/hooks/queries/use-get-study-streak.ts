import { getStudyStreak } from '@/api/streakApi';
import { ApiError } from '@/types/api';
import { StudyStreak } from '@/types/streak';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const useGetStudyStreak = () => {
    return useQuery<StudyStreak, AxiosError<ApiError>>({
        queryKey: ['studyStreak'],
        queryFn: getStudyStreak
    });
};

export default useGetStudyStreak;
