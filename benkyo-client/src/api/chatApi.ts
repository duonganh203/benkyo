import { api } from '.';
import { ChatResponse } from '@/types/document';

export const chatWithDocument = async (documentId: string, question: string) => {
    const response = await api.post('chat', {
        documentId,
        question
    });
    return response.data as ChatResponse;
};
