import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { requestJoinClassApi } from '@/api/classApi';
import { ClassJoinRequestDto, ClassJoinResponseDto } from '@/types/class';
import { getToast } from '@/utils/getToast';

const useRequestJoinClass = () => {
    const queryClient = useQueryClient();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassJoinRequestDto>({
        mutationFn: ({ classId }) => requestJoinClassApi(classId),
        onSuccess: (data, variables) => {
            getToast('success', data.message);
            queryClient.invalidateQueries({ queryKey: ['myClasses'] });
            queryClient.invalidateQueries({ queryKey: ['suggestedClasses'] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
        },
        onError: (error) => {
            getToast('error', error?.message);
        }
    });
};

export default useRequestJoinClass;
