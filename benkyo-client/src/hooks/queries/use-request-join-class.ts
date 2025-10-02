import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { requestJoinClassApi } from '@/api/classApi';
import { ClassJoinRequestDto, ClassJoinResponseDto } from '@/types/class';
import { getToast } from '@/utils/getToast';
import { useNavigate } from 'react-router-dom';

const useRequestJoinClass = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<ClassJoinResponseDto, AxiosError<ApiError>, ClassJoinRequestDto>({
        mutationFn: ({ classId }) => requestJoinClassApi(classId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Requested to join class');
            queryClient.invalidateQueries({ queryKey: ['myClasses'] });
            queryClient.invalidateQueries({ queryKey: ['suggestedClasses'] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            navigate(`/class/${variables.classId}`);
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to request join');
        }
    });
};

export default useRequestJoinClass;
