import { useQuery } from '@tanstack/react-query';
import { getAllMoocs } from '@/api/moocApi';

const useGetAllMoocs = (classId?: string) => {
    return useQuery({
        queryKey: ['moocs', classId],
        queryFn: () => (classId ? getAllMoocs(classId) : Promise.resolve(null)),
        enabled: !!classId
    });
};

export default useGetAllMoocs;
