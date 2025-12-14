import { Request, Response } from 'express';
import {
    triggerManualOptimization,
    getOptimizationStatus as getOptimizationStatusService
} from '~/services/optimizerService';

export const triggerOptimization = async (req: Request, res: Response) => {
    const { deckId } = req.params;
    const userId = req.user._id;

    if (!deckId) {
        return res.status(400).json({ error: 'Deck ID is required' });
    }

    const result = await triggerManualOptimization(deckId, userId);

    res.json(result);
};

export const getOptimizationStatus = async (req: Request, res: Response) => {
    const { deckId } = req.params;

    if (!deckId) {
        return res.status(400).json({ error: 'Deck ID is required' });
    }

    const status = await getOptimizationStatusService(deckId);

    res.json(status);
};
