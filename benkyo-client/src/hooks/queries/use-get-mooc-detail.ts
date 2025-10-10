import { useQuery } from '@tanstack/react-query';
import { getMoocById } from '@/api/moocApi';

export const useGetMoocDetail = (moocId: string) => {
    return useQuery({
        queryKey: ['mooc-detail', moocId],
        queryFn: () => getMoocById(moocId),
        select: (response) => response.data as any,
        staleTime: 1000 * 60 * 5
    });
};
