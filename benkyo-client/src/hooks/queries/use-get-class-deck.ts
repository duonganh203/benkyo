import { useQuery } from '@tanstack/react-query';
import { getClassDeckApi } from '@/api/classApi';

export const useGetClassDeck = (classId: string) => {
    return useQuery({
        queryKey: ['class-deck', classId],
        queryFn: () => getClassDeckApi(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassDeck;
