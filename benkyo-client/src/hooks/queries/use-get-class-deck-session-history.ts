import { getClassDeckSessionHistoryApi } from '@/api/classApi';
import { useQuery } from '@tanstack/react-query';
import { ClassStudySessionHistory } from '@/types/class';

const useGetClassDeckSessionHistory = (classId: string, deckId: string) => {
    return useQuery<ClassStudySessionHistory[]>({
        queryKey: ['class-deck-session-history', classId, deckId],
        queryFn: () => getClassDeckSessionHistoryApi(classId, deckId),
        enabled: !!classId && !!deckId
    });
};

export default useGetClassDeckSessionHistory;
