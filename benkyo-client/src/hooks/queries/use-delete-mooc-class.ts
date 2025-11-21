import { useMutation } from '@tanstack/react-query';
import { deleteMooc } from '@/api/moocApi';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

const useDeleteMooc = () => {
    return useMutation<{ success: boolean; message: string }, AxiosError<ApiError>, string>({
        mutationKey: ['deleteMooc'],
        mutationFn: (moocId: string) => deleteMooc(moocId)
    });
};

export default useDeleteMooc;
