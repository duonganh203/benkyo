import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/api';
import { getDecksToAddToClassApi } from '@/api/classApi';
import { DeckToAddClassResponseDto } from '@/types/class';

const useGetDeckToAddClass = (classId: string) => {
    return useQuery<DeckToAddClassResponseDto[], AxiosError<ApiError>>({
        queryKey: ['deckClass', classId],
        queryFn: () => getDecksToAddToClassApi(classId),
        enabled: !!classId
    });
};

export default useGetDeckToAddClass;
