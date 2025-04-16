import { Document } from '@/types/document';
import { api } from '.';

export const uploadDocument = async (formData: FormData) => {
    const response = await api.post('documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as Document;
};

export const getUserDocuments = async () => {
    const response = await api.get('documents');
    return response.data as Document[];
};

export const getDocumentById = async (documentId: string) => {
    const response = await api.get(`documents/${documentId}`);
    return response.data as Document;
};

export const deleteDocument = async (documentId: string) => {
    const response = await api.delete(`documents/${documentId}`);
    return response.data;
};
