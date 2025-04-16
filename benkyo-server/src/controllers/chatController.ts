import { Request, Response } from 'express';
import { chatWithDocumentService } from '~/services/chatService';
import { chatWithDocumentValidation } from '~/validations/documentValidation';

export const chatWithDocument = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { documentId, question } = req.body;
    chatWithDocumentValidation.parse({ documentId, question });
    const response = await chatWithDocumentService(userId, documentId, question);
    res.json(response);
};
