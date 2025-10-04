import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { getLikedDecks } from '@/api/deckApi';

export interface Deck {
    id: string;
    name: string;
    description?: string;
    likeCount: number;
    cardCount: number;
    creatorName: string;
    createdAt: string;
    updatedAt: string;
}

export const useLikedDecksHistory = () => {
    return useQuery<Deck[], AxiosError<ApiError>>({
        queryKey: ['likedDecks'],
        queryFn: getLikedDecks,
        staleTime: 1000 * 60
    });
};
