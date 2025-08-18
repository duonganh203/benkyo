import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/types/api';
import { ClassUserRequestDto, ClassUserResponseDto } from '@/types/class';
import { createClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useClassCreate = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<ClassUserResponseDto, AxiosError<ApiError>, ClassUserRequestDto>({
        mutationFn: createClassApi,
        onSuccess: (data) => {
            getToast('success', `Create class ${data.name} successfully`);
            queryClient.invalidateQueries({ queryKey: ['myClasses'] });
            queryClient.invalidateQueries({ queryKey: ['class', data._id] });
            navigate(`/class/${data._id}/management`);
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to create class');
        }
    });
};

export default useClassCreate;
