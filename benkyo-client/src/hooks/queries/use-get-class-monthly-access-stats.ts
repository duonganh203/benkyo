import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

interface MonthlyAccessStats {
    month: string;
    visits: number;
    members: number;
    uniqueVisitors: number;
}

const getClassMonthlyAccessStats = async (classId: string): Promise<MonthlyAccessStats[]> => {
    const response = await api.get(`/class/${classId}/monthly-access-stats`);
    return response.data;
};

export const useGetClassMonthlyAccessStats = (classId: string) => {
    return useQuery({
        queryKey: ['class-monthly-access-stats', classId],
        queryFn: () => getClassMonthlyAccessStats(classId),
        enabled: !!classId,
        retry: false
    });
};
