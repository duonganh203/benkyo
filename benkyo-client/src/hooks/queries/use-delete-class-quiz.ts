import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMoocDeckQuizApi } from '@/api/classApi';

const useDeleteMoocDeckQuiz = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ classId, quizId }: { classId: string; quizId: string }) =>
            deleteMoocDeckQuizApi(classId, quizId),

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['class-quizzes', variables.classId]
            });
        }
    });
};

export default useDeleteMoocDeckQuiz;
