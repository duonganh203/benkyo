import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { AddDeckToClassRequestDto, AddDeckToClassResponseDto } from '@/types/class';
import { addDeckToClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useAddDeckToClass = () => {
    const queryClient = useQueryClient();
    return useMutation<AddDeckToClassResponseDto, AxiosError<ApiError>, AddDeckToClassRequestDto>({
        mutationFn: addDeckToClassApi,
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Deck added to class');
            queryClient.invalidateQueries({ queryKey: ['classDecks', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['deckClass', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to add deck');
        }
    });
};

export default useAddDeckToClass;
