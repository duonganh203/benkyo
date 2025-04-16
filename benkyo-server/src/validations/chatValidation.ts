import z from 'zod';

export const getConversationValidation = z.object({
    documentId: z.string().min(1, 'Document ID is required')
});
export const chatWithDocumentValidation = z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    question: z.string().min(1, 'Question is required')
});
