import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { chatWithDocument } from '@/api/chatApi';
import { ChatResponse } from '@/types/chat';

const useChatWithDocument = () => {
    return useMutation<ChatResponse, AxiosError<ApiError>, { documentId: string; question: string }>({
        mutationFn: ({ documentId, question }) => chatWithDocument(documentId, question)
    });
};

export default useChatWithDocument;
