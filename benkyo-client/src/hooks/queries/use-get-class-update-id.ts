import { getClassUpdateByIdApi } from '@/api/classApi';
import { useQuery } from '@tanstack/react-query';

const useGetClassUpdateById = (_id: string) => {
    return useQuery({
        queryKey: ['classUpdateId', _id],
        queryFn: () => getClassUpdateByIdApi(_id),
        enabled: !!_id
    });
};

export default useGetClassUpdateById;
