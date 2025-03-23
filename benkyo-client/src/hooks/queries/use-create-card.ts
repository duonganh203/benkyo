import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { CardFormData, CreateCardRes } from '@/types/card';
import { createCard } from '@/api/cardApi';
const useCreateCard = () => {
    return useMutation<CreateCardRes, AxiosError<ApiError>, CardFormData>({
        mutationFn: createCard
    });
};
export default useCreateCard;
