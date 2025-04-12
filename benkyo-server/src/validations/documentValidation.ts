import z from 'zod';

export const uploadDocumentValidation = z.object({
    documentName: z.string().min(1, 'Document name is required')
});

export const chatWithDocumentValidation = z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    question: z.string().min(1, 'Question is required')
});
