import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { EndClassDeckSessionResponseDto } from '@/types/class';
import { endClassDeckSessionApi } from '@/api/classApi';

const useEndClassDeckSession = () => {
    return useMutation<
        EndClassDeckSessionResponseDto,
        AxiosError<ApiError>,
        { classId: string; deckId: string; sessionId: string; duration: number }
    >({
        mutationFn: ({ classId, deckId, sessionId, duration }) =>
            endClassDeckSessionApi(classId, deckId, sessionId, duration)
    });
};

export default useEndClassDeckSession;
