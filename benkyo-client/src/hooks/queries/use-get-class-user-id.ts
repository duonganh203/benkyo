import { getClassUserByIdApi } from '@/api/classApi';
import { useQuery } from '@tanstack/react-query';

const useGetClassUserById = (_id: string) => {
    return useQuery({
        queryKey: ['classClassUserId', _id],
        queryFn: () => getClassUserByIdApi(_id),
        enabled: !!_id
    });
};

export default useGetClassUserById;
