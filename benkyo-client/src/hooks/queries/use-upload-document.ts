import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { uploadDocument } from '@/api/documentApi';
import { Document } from '@/types/document';

const useUploadDocument = () => {
    return useMutation<Document, AxiosError<ApiError>, FormData>({
        mutationFn: (formData) => uploadDocument(formData)
    });
};

export default useUploadDocument;
