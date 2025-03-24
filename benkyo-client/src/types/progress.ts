import { DeckDetails } from './deck';

export interface UserProgressResponse {
    totalReviews: number;
    totalFlashcards: number;
    masteredFlashcards: number;
    studyingFlashcards: number;
    newFlashcards: number;
    completionRate: number;
    recommendedDecks: UserDeckState[];
}

export interface UserDeckState {
    user: string;
    deck: DeckDetails;
    isOriginalOwner: boolean;
    newCardsPerDay: number;
    reviewsPerDay: number;
    lastStudied: Date;
    createdAt: Date;
    stats: {
        streak: number;
        totalCards: number;
        newCards: number;
        learningCards: number;
        reviewCards: number;
    };
}
