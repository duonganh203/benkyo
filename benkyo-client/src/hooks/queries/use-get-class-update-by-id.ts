import { getClassUpdateByIdApi } from '@/api/classApi';
import { useQuery } from '@tanstack/react-query';

const useGetClassUpdateById = (classId: string) => {
    return useQuery({
        queryKey: ['classUpdateId', classId],
        queryFn: () => getClassUpdateByIdApi(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassUpdateById;
