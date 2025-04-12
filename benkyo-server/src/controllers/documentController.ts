import { Request, Response } from 'express';
import {
    uploadDocumentService,
    getUserDocumentsService,
    getDocumentByIdService,
    deleteDocumentService,
    chatWithDocumentService
} from '~/services/documentService';
import { uploadDocumentValidation, chatWithDocumentValidation } from '~/validations/documentValidation';

export const uploadDocument = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { documentName } = req.body;
    uploadDocumentValidation.parse({ documentName });
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const document = await uploadDocumentService(userId, req.file, documentName);
    res.json(document);
};

export const getUserDocuments = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const documents = await getUserDocumentsService(userId);
    res.json(documents);
};

export const getDocumentById = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const documentId = req.params.id;
    const document = await getDocumentByIdService(documentId, userId);
    res.json(document);
};

export const deleteDocument = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const documentId = req.params.id;
    const result = await deleteDocumentService(documentId, userId);
    res.json(result);
};

export const chatWithDocument = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { documentId, question } = req.body;
    chatWithDocumentValidation.parse({ documentId, question });
    const response = await chatWithDocumentService(userId, documentId, question);
    res.json(response);
};
