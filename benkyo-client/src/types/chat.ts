export interface ChatResponse {
    question: string;
    response: string;
    conversationId?: string;
}

export interface ConversationRes {
    _id: string;
    userId: string;
    documentId: string;
    question: string;
    response: string;
    createdAt: string;
}
