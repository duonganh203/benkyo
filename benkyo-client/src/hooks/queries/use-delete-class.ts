import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { deleteClassApi } from '@/api/classApi';

const useDeleteCard = () => {
    return useMutation<{ message: string }, AxiosError<ApiError>, { _id: string }>({
        mutationFn: ({ _id }) => deleteClassApi(_id)
    });
};
export default useDeleteCard;
