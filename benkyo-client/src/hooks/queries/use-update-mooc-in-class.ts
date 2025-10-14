import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { updateMooc } from '@/api/moocApi';
import { UpdateMoocPayload, MoocInterface } from '@/types/mooc';

export interface UpdateMoocRes {
    success: boolean;
    message: string;
    data: MoocInterface;
}

const useUpdateMooc = () => {
    return useMutation<UpdateMoocRes, AxiosError<ApiError>, { moocId: string; payload: UpdateMoocPayload }>({
        mutationFn: ({ moocId, payload }) => updateMooc(moocId, payload)
    });
};

export default useUpdateMooc;
