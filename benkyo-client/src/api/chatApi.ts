import { ChatResponse, ConversationRes } from '@/types/chat';
import { api } from '.';

export const getAllConversations = async (documentId: string) => {
    const response = await api.get('chat', {
        params: {
            documentId
        }
    });
    return response.data as ConversationRes[];
};

export const chatWithDocument = async (documentId: string, question: string) => {
    const response = await api.post('chat', {
        documentId,
        question
    });
    return response.data as ChatResponse;
};
