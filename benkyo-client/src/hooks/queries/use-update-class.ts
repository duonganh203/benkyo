import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { ClassUserRequestDto, ClassUserResponseDto } from '@/types/class';
import { updateClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';
import { useNavigate } from 'react-router-dom';

type ClassUserRequestUpdateDto = {
    classId: string;
    requestClass: ClassUserRequestDto;
};

const useUpdateClass = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<ClassUserResponseDto, AxiosError<ApiError>, ClassUserRequestUpdateDto>({
        mutationFn: ({ classId, requestClass }) => updateClassApi(classId, requestClass),
        onSuccess: (data, variables) => {
            getToast('success', `Class updated successfully`);
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classId', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classUpdateId', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classList'] });
            navigate(`/class/${data._id}/management`);
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to update class');
        }
    });
};

export default useUpdateClass;
