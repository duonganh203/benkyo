import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { RemoveDeckClassResponseDto, RemoveDeckClassRequestDto } from '@/types/class';
import { removeDeckFromClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useRemoveDeckFromClass = () => {
    const queryClient = useQueryClient();
    return useMutation<RemoveDeckClassResponseDto, AxiosError<ApiError>, RemoveDeckClassRequestDto>({
        mutationFn: ({ classId, deckId }) => removeDeckFromClassApi(classId, deckId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Deck removed from class');
            queryClient.invalidateQueries({ queryKey: ['classDecks', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to remove deck');
        }
    });
};

export default useRemoveDeckFromClass;
