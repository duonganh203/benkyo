import { AxiosError } from 'axios';
import { getAllConversations } from '@/api/chatApi';
import { ApiError } from '@/types/api';
import { ConversationRes } from '@/types/chat';
import { useQuery } from '@tanstack/react-query';

const useGetAllConversations = (documentId: string) => {
    return useQuery<ConversationRes[], AxiosError<ApiError>>({
        queryKey: ['conversation', documentId],
        queryFn: () => getAllConversations(documentId),
        enabled: !!documentId
    });
};

export default useGetAllConversations;
