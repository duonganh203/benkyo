import { useQuery } from '@tanstack/react-query';
import { classApi } from '@/api/classApi';

export const useGetClassDeck = (classId: string) => {
    return useQuery({
        queryKey: ['class-deck', classId],
        queryFn: () => classApi.getClassDeck(classId),
        enabled: !!classId,
        retry: false
    });
};

export default useGetClassDeck;
