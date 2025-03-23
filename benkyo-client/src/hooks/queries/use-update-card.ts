import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { CardFormData, updateCardRes } from '@/types/card';
import { updateCard } from '@/api/cardApi';
const useUpdateCard = () => {
    return useMutation<updateCardRes, AxiosError<ApiError>, { cardId: string; data: CardFormData }>({
        mutationFn: ({ cardId, data }) => updateCard(cardId, data)
    });
};
export default useUpdateCard;
