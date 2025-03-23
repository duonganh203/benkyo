import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { CreateDeckRes } from '@/types/deck';
import { useMutation } from '@tanstack/react-query';
import { deleteCard } from '@/api/cardApi';

const useDeleteCard = () => {
    return useMutation<CreateDeckRes, AxiosError<ApiError>, { cardId: string }>({
        mutationKey: ['deleteCard'],
        mutationFn: ({ cardId }) => deleteCard(cardId)
    });
};
export default useDeleteCard;
