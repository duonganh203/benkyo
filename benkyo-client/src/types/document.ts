export interface Document {
    _id: string;
    userId: string;
    name: string;
    type: string;
    url: string;
    embeddingId: string;
    createdAt: string;
}

export interface ChatResponse {
    question: string;
    response: string;
    conversationId?: string;
}
