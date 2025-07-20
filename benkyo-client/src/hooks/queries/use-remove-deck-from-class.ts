import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { RemoveDeckClassResponseDto, RemoveDeckClassRequestDto } from '@/types/class';
import { removeDeckFromClassApi } from '@/api/classApi';

const useRemoveDeckFromClass = () => {
    return useMutation<RemoveDeckClassResponseDto, AxiosError<ApiError>, RemoveDeckClassRequestDto>({
        mutationFn: ({ classId, deckId }) => removeDeckFromClassApi(classId, deckId)
    });
};

export default useRemoveDeckFromClass;
