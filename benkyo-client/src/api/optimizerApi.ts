import { api } from '.';

export interface OptimizationStatus {
    learnedCardCount: number;
    lastOptimized: string | null;
    status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
    message: string | null;
    threshold: number;
}

export interface OptimizationResult {
    success: boolean;
    weights: number[];
    message: string;
    review_count: number;
    retention_rate?: number;
}

export const getOptimizationStatus = async (deckId: string): Promise<OptimizationStatus> => {
    const response = await api.get(`optimizer/${deckId}/status`);
    return response.data;
};

export const triggerOptimization = async (deckId: string): Promise<OptimizationResult> => {
    const response = await api.post(`optimizer/${deckId}/trigger`);
    return response.data;
};
