import 'dotenv/config';
import { Pinecone, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';
import { UnprocessableEntity } from '~/exceptions/unprocessableEntity';
import { ErrorCode } from '~/exceptions/root';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || ''
});

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;
export const DIMENSION = 1024;

export const initPineconeIndex = async () => {
    const existingIndexes = await pinecone.listIndexes();

    if (!existingIndexes.indexes || !existingIndexes.indexes.some((index) => index.name === PINECONE_INDEX_NAME)) {
        await pinecone.createIndex({
            name: PINECONE_INDEX_NAME,
            dimension: DIMENSION,
            metric: 'dotproduct',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });
    }

    return pinecone.index(PINECONE_INDEX_NAME);
};

export const getPineconeIndex = () => {
    return pinecone.index(PINECONE_INDEX_NAME);
};

export const upsertVectors = async (vectors: PineconeRecord<RecordMetadata>[]) => {
    if (vectors.length > 0 && vectors[0]?.values && vectors[0].values.length !== DIMENSION) {
        const actualDimension = vectors[0].values.length;
        throw new UnprocessableEntity(
            null,
            `Vector dimension mismatch: Your vectors have dimension ${actualDimension} but the Pinecone index expects ${DIMENSION}. ` +
                `Please update the DIMENSION constant in pineconeService.ts or recreate your index with the correct dimension.`,
            ErrorCode.UNPROCESSALE_ENTITY
        );
    }

    const index = await initPineconeIndex();
    await index.upsert(vectors);
    return true;
};

export const queryVectors = async (vector: number[], topK: number = 5, filter?: Record<string, unknown>) => {
    if (vector.length !== DIMENSION) {
        throw new UnprocessableEntity(
            null,
            `Vector dimension mismatch: Your query vector has dimension ${vector.length} but the Pinecone index expects ${DIMENSION}. ` +
                `Please ensure your embedding model outputs vectors with dimension ${DIMENSION}.`,
            ErrorCode.UNPROCESSALE_ENTITY
        );
    }

    const index = await initPineconeIndex();
    const queryResponse = await index.query({
        vector,
        topK,
        includeMetadata: true,
        filter
    });

    return queryResponse.matches;
};

export const deleteVectors = async (ids: string[]) => {
    const index = await initPineconeIndex();
    await index.deleteMany(ids);
    return true;
};
