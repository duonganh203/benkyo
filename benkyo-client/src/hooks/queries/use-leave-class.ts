import { leaveClassApi } from '@/api/classApi';
import { ApiError } from '@/types/api';
import { getToast } from '@/utils/getToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

const useLeaveClass = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<{ message: string }, AxiosError<ApiError>, { classId: string }>({
        mutationFn: ({ classId }) => leaveClassApi(classId),
        onSuccess: (data, variables) => {
            getToast('success', data.message || 'Left class successfully');
            queryClient.invalidateQueries({ queryKey: ['myClass'] });
            queryClient.invalidateQueries({ queryKey: ['class', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classMembers', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classDecks', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classInvited', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classRequestJoin', variables.classId] });
            queryClient.invalidateQueries({ queryKey: ['classVisited', variables.classId] });
            navigate('/class/list');
        },
        onError: (error) => {
            getToast('error', error?.message || 'Failed to leave class');
        }
    });
};

export default useLeaveClass;
