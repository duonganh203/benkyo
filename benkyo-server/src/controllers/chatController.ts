import { Request, Response } from 'express';
import { chatWithDocumentService, getAllConversationsService } from '~/services/chatService';
import { chatWithDocumentValidation, getConversationValidation } from '~/validations/chatValidation';

export const chatWithDocument = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { documentId, question } = req.body;
    chatWithDocumentValidation.parse({ documentId, question });
    const response = await chatWithDocumentService(userId, documentId, question);
    res.json(response);
};

export const getAllConversations = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { documentId } = req.query;
    getConversationValidation.parse({ documentId });
    const conversations = await getAllConversationsService(userId, documentId as string);
    res.json(conversations);
};
