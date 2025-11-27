import { leaveClassApi } from '@/api/classApi';
import { ApiError } from '@/types/api';
import { getToast } from '@/utils/getToast';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

const useLeaveClass = () => {
    const navigate = useNavigate();

    return useMutation<{ message: string }, AxiosError<ApiError>, { classId: string }>({
        mutationFn: ({ classId }) => leaveClassApi(classId),
        onSuccess: (data) => {
            getToast('success', data.message || 'Left class successfully');
            navigate('/class/list');
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to leave class');
        }
    });
};

export default useLeaveClass;
