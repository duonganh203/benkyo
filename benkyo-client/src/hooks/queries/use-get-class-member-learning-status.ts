import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

interface MemberLearningStatus {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    totalDecks: number;
    completedDecks: number;
    inProgressDecks: number;
    notStartedDecks: number;
    overallProgress: number;
    lastStudyDate?: Date;
    studyStreak: number;
    deckStatuses: Array<{
        deckId: string;
        deckName: string;
        description: string;
        status: 'completed' | 'in_progress' | 'not_started';
        progress: number;
        totalCards: number;
        completedCards: number;
        lastStudyDate?: Date;
        startTime?: Date;
        endTime?: Date;
        isOverdue: boolean;
        hoursOverdue?: number;
        hoursUntilDeadline?: number;
    }>;
}

const getClassMemberLearningStatus = async (classId: string): Promise<MemberLearningStatus[]> => {
    const response = await api.get(`/class/${classId}/member-learning-status`);
    return response.data;
};

export const useGetClassMemberLearningStatus = (classId: string) => {
    return useQuery({
        queryKey: ['class-member-learning-status', classId],
        queryFn: () => getClassMemberLearningStatus(classId),
        enabled: !!classId,
        retry: false
    });
};
