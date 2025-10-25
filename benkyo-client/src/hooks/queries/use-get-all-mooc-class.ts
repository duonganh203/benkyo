import { useQuery } from '@tanstack/react-query';
import { getAllMoocs } from '@/api/moocApi';
import { AllMoocsResponse } from '@/types/mooc';

const useGetAllMoocs = (classId?: string) => {
    return useQuery<AllMoocsResponse>({
        queryKey: ['moocs', classId],
        queryFn: async () => {
            if (!classId) throw new Error('classId is required');
            return await getAllMoocs(classId);
        },
        enabled: !!classId
    });
};

export default useGetAllMoocs;
