import z from 'zod';

export const uploadDocumentValidation = z.object({
    documentName: z.string().min(1, 'Document name is required')
});
