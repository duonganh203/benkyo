import { useState } from 'react';
import { UserProgress } from '@/types/learning';

const initialProgress: UserProgress = {
    currentClass: 'class-1',
    currentMooc: 'mooc-1',
    completedDecks: [],
    testScores: {},
    totalPoints: 0,
    deckPoints: {}
};

export const useUserProgressUi = () => {
    const [progress, setProgress] = useState<UserProgress>(initialProgress);

    const addPoints = (deckId: string, points: number) => {
        setProgress((prev) => ({
            ...prev,
            totalPoints: prev.totalPoints + points,
            deckPoints: {
                ...prev.deckPoints,
                [deckId]: (prev.deckPoints[deckId] || 0) + points
            }
        }));
    };

    const updateTestScore = (deckId: string, score: number) => {
        setProgress((prev) => ({
            ...prev,
            testScores: {
                ...prev.testScores,
                [deckId]: score
            }
        }));
    };

    const completeDeck = (deckId: string) => {
        setProgress((prev) => ({
            ...prev,
            completedDecks: [...prev.completedDecks, deckId]
        }));
    };

    const canUnlockDeck = (pointsRequired: number): boolean => {
        return progress.totalPoints >= pointsRequired;
    };

    return {
        progress,
        addPoints,
        updateTestScore,
        completeDeck,
        canUnlockDeck
    };
};
