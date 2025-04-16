import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '~/schemas';
import { processDocument } from './embeddingService';
import { queryVectors, deleteVectors, DIMENSION } from './pineconeService';
import { ErrorCode } from '~/exceptions/root';
import { UnauthorizedException } from '~/exceptions/unauthorized';
import { NotFoundException } from '~/exceptions/notFound';

export const uploadDocumentService = async (userId: string, file: Express.Multer.File, documentName: string) => {
    const documentId = uuidv4();
    await processDocument(file.path, documentId, documentName, userId);

    const document = await Document.create({
        userId,
        name: documentName,
        type: path.extname(file.originalname).substring(1),
        embeddingId: documentId,
        createdAt: new Date()
    });
    if (file && file.path) {
        await fs.remove(file.path).catch(() => {});
    }
    return document;
};

export const getUserDocumentsService = async (userId: string) => {
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });
    return documents;
};

export const getDocumentByIdService = async (documentId: string, userId: string) => {
    const document = await Document.findById(documentId);
    if (!document) {
        throw new NotFoundException('Document not found', ErrorCode.NOT_FOUND);
    }
    if (document.userId.toString() !== userId) {
        throw new UnauthorizedException('You do not have permission to access this document', ErrorCode.UNAUTHORIZED);
    }
    return document;
};

export const deleteDocumentService = async (documentId: string, userId: string) => {
    const document = await Document.findById(documentId);
    if (!document) {
        throw new NotFoundException('Document not found', ErrorCode.NOT_FOUND);
    }
    if (document.userId.toString() !== userId) {
        throw new UnauthorizedException('You do not have permission to delete this document', ErrorCode.UNAUTHORIZED);
    }
    const dummyVector = Array(DIMENSION).fill(0);
    const matches = await queryVectors(dummyVector, 1000, { documentId: document.embeddingId });
    if (matches && matches.length > 0) {
        const chunkIds = matches.map((match) => match.id);
        await deleteVectors(chunkIds);
    }
    await Document.findByIdAndDelete(documentId);
    return { success: true, message: 'Document deleted successfully' };
};
