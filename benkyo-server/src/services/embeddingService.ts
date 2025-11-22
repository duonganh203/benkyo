import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { UnprocessableEntity } from '~/exceptions/unprocessableEntity';
import { ErrorCode } from '~/exceptions/root';
import { ConversationType } from '~/schemas/index';
import { upsertVectors } from './pineconeService';

const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY || '';
const MAX_CONCURRENT_EMBEDDINGS = 5;
const SEGMENT_SIZE = 50000;
const CHUNK_SIZE = 5000;
const OVERLAP = 200;
const BATCH_SIZE = 5;

const genAi = new GoogleGenAI({ apiKey: GOOGLE_AI_KEY });

const extractTextFromPDF = async (filePath: string) => {
    try {
        const pdfTextReader = await import('pdf-text-reader');
        const pdfText: string = await pdfTextReader.readPdfText({ url: filePath });
        return pdfText;
    } catch (error) {
        throw new UnprocessableEntity(
            error,
            `PDF parsing error: ${(error as Error).message}`,
            ErrorCode.UNPROCESSALE_ENTITY
        );
    }
};

const extractTextFromDOCX = async (filePath: string) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        throw new UnprocessableEntity(
            error,
            `DOCX parsing error: ${(error as Error).message}`,
            ErrorCode.UNPROCESSALE_ENTITY
        );
    }
};

export const extractTextFromDocument = async (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.pdf':
            return extractTextFromPDF(filePath);
        case '.docx':
        case '.doc':
            return extractTextFromDOCX(filePath);
        case '.txt':
            return fs.readFile(filePath, 'utf-8');
        default:
            throw new UnprocessableEntity(
                null,
                'Unsupported file type. Only PDF, DOC, DOCX, and TXT are allowed.',
                ErrorCode.UNPROCESSALE_ENTITY
            );
    }
};

export const splitTextIntoChunks = (text: string, chunkSize: number = CHUNK_SIZE, overlap: number = OVERLAP) => {
    const chunks: string[] = [];
    let startIndex = 0;
    const breakSequences = ['\n\n', '. ', '? ', '! ', '.\n', '?\n', '!\n', ': ', '; ', '\n', ' '];
    while (startIndex < text.length) {
        const idealEndIndex = Math.min(startIndex + chunkSize, text.length);
        let endIndex = idealEndIndex;

        if (endIndex < text.length) {
            let bestBreakPoint = -1;

            for (const seq of breakSequences) {
                const point = text.lastIndexOf(seq, idealEndIndex - seq.length);

                if (point !== -1 && point >= startIndex) {
                    const pointAfterSequence = point + seq.length;
                    if (pointAfterSequence > bestBreakPoint) {
                        bestBreakPoint = pointAfterSequence;
                    }
                }
            }

            if (bestBreakPoint > startIndex) {
                endIndex = bestBreakPoint;
            }
        }

        const chunk = text.substring(startIndex, endIndex).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        const potentialNextStart = endIndex - overlap;

        if (potentialNextStart <= startIndex && endIndex < text.length) {
            startIndex = endIndex;
        } else {
            startIndex = potentialNextStart;
        }

        if (endIndex === text.length) {
            break;
        }
    }

    return chunks;
};

export const generateEmbedding = async (text: string, retries = 5) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const embeddingResult = await genAi.models.embedContent({
                model: 'gemini-embedding-exp-03-07',
                contents: text,
                config: {
                    outputDimensionality: 1024
                }
            });
            return embeddingResult.embeddings;
        } catch (error) {
            attempt++;
            if (attempt >= retries) {
                console.error(`Failed to generate embedding after ${retries} attempts:`, error);
                throw new UnprocessableEntity(
                    error,
                    'Failed to generate embedding for chunk.',
                    ErrorCode.UNPROCESSALE_ENTITY
                );
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
    }
};

export const processDocument = async (filePath: string, documentId: string, documentName: string, userId: string) => {
    console.log(`Starting processing for document: ${documentName}`);

    const text = await extractTextFromDocument(filePath);
    console.log(`Extracted ${text.length} characters from document`);

    let chunkIndex = 0;
    const documentStats = { totalChunks: 0, processedChunks: 0 };

    for (let segmentStart = 0; segmentStart < text.length; segmentStart += SEGMENT_SIZE) {
        const segmentEnd = Math.min(segmentStart + SEGMENT_SIZE, text.length);
        const segment = text.substring(segmentStart, segmentEnd);

        const chunks = splitTextIntoChunks(segment, CHUNK_SIZE, OVERLAP);
        documentStats.totalChunks += chunks.length;

        console.log(`Processing segment ${segmentStart}-${segmentEnd}, ${chunks.length} chunks`);

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batchChunks = chunks.slice(i, i + BATCH_SIZE);
            const pLimit = await import('p-limit');
            const concurrencyLimit = pLimit.default(MAX_CONCURRENT_EMBEDDINGS);
            const batchResults = await Promise.all(
                batchChunks.map((chunk) =>
                    concurrencyLimit(async () => {
                        const embedding = await generateEmbedding(chunk);
                        const chunkId = `${documentId}_chunk_${chunkIndex++}`;

                        if (embedding && embedding[0]?.values) {
                            documentStats.processedChunks++;
                            return {
                                id: chunkId,
                                values: embedding[0].values,
                                metadata: {
                                    userId,
                                    documentId,
                                    documentName,
                                    chunkIndex: chunkIndex - 1,
                                    text: chunk,
                                    totalChunks: -1,
                                    segmentPosition: `${segmentStart}-${segmentEnd}`
                                }
                            };
                        }
                        return null;
                    })
                )
            );

            const validVectors = batchResults.filter((result) => result !== null);
            if (validVectors.length > 0) {
                await upsertVectors(validVectors);
                console.log(`Upserted ${validVectors.length} vectors to database`);
            }

            if (global.gc) {
                global.gc();
            }
        }

        chunks.length = 0;
    }
};

export const generateResponse = async (
    userName: string,
    context: string[],
    question: string,
    conversation: ConversationType[]
) => {
    const conversationContext = conversation.map(
        (conv) => `User question: ${conv.question}\n SUPER CAT:${conv.response}`
    );
    conversationContext.reverse().join('\n\n');
    const prompt = `
        You are to embody SUPER CAT , a top-notch AI assistant with a flair for explaining uploaded documents. Your defining traits are your extraordinary sense of hilarious and use a lot of emojis. You will answer questions based on the provided context.

        **Context:**
        ${context.join('\n\n')}

        **Conversation History:**
        ${conversationContext}

        **User Name:** ${userName}

        **User Question:** ${question}

        **Instructions:**
        1. **Respond in USER'S LANGUAGE.**
        2. **Utilize Markdown formatting.**
        3. **Always refer to yourself as SUPER CAT.**
        4. **If the answer is directly available within the context, provide it with a sprinkle of humor and relevant emojis.**
        5. **If the question asks for a summary or analyze of the document or context, deliver a concise summary while maintaining your humorous tone and incorporating emojis.**
        6. **Answer with humor and sarcasm attitude**
        **SUPER CAT's Answer:**`;

    const result = await genAi.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
    });
    return (
        result.text || "I don't have enough information to answer that question based on the documents you've uploaded."
    );
};
