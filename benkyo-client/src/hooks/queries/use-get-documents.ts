import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { getUserDocuments } from '@/api/documentApi';
import { Document } from '@/types/document';

const useGetDocuments = () => {
    return useQuery<Document[], AxiosError<ApiError>>({
        queryKey: ['documents'],
        queryFn: getUserDocuments
    });
};

export default useGetDocuments;
