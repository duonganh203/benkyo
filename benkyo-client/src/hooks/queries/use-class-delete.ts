import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import { deleteClassApi } from '@/api/classApi';

const useClassDelete = () => {
    return useMutation<{ message: string }, AxiosError<ApiError>, string>({
        mutationFn: (classId) => deleteClassApi(classId)
    });
};

export default useClassDelete;
