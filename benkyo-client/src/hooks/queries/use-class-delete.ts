import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteClassApi } from '@/api/classApi';
import { getToast } from '@/utils/getToast';

const useClassDelete = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<{ message: string }, AxiosError<ApiError>, string>({
        mutationFn: (classId) => deleteClassApi(classId),
        onSuccess: (data) => {
            getToast('success', data.message || 'Class deleted');
            queryClient.invalidateQueries({ queryKey: ['myClasses'] });
            queryClient.invalidateQueries({ queryKey: ['classList'] });
            navigate('/class/list');
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to delete class');
        }
    });
};

export default useClassDelete;
