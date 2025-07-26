import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { StartClassDeckSessionResponseDto } from '@/types/class';
import { startClassDeckSessionApi } from '@/api/classApi';

const useStartClassDeckSession = () => {
    return useMutation<
        StartClassDeckSessionResponseDto,
        AxiosError<ApiError>,
        { classId: string; deckId: string; forceNew?: boolean }
    >({
        mutationFn: ({ classId, deckId, forceNew }) => startClassDeckSessionApi(classId, deckId, forceNew)
    });
};

export default useStartClassDeckSession;
