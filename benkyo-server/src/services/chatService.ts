import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Conversation, Document, User } from '~/schemas';
import { generateEmbedding, generateResponse } from './embeddingService';
import { queryVectors } from './pineconeService';

export const chatWithDocumentService = async (userId: string, documentId: string, question: string) => {
    const document = await Document.findById(documentId);
    const user = await User.findById(userId);
    if (!document) {
        throw new NotFoundException('Document not found', ErrorCode.NOT_FOUND);
    }
    if (!user) {
        throw new NotFoundException('User not found', ErrorCode.NOT_FOUND);
    }

    const conversationHistory = await Conversation.find({
        userId,
        documentId: documentId
    })
        .limit(5)
        .sort({ createdAt: -1 });

    const embedding = await generateEmbedding(question);
    if (!embedding || !embedding[0]?.values) {
        return {
            question,
            response: "I couldn't generate embeddings for your question. Please try again."
        };
    }

    const matches = await queryVectors(embedding[0].values, 5, { documentId: document.embeddingId });
    if (!matches || matches.length === 0) {
        return {
            question,
            response: "I couldn't find any relevant information in the document to answer your question."
        };
    }

    const contextChunks = matches
        .map((match) => {
            if (match.metadata && typeof match.metadata === 'object' && 'text' in match.metadata) {
                return String(match.metadata.text);
            }
            return '';
        })
        .filter((text) => text !== '');

    const response = await generateResponse(user.name, contextChunks, question, conversationHistory);

    const conversation = await Conversation.create({
        userId,
        documentId,
        question,
        response,
        createdAt: new Date()
    });

    return {
        question,
        response,
        conversationId: conversation._id
    };
};
