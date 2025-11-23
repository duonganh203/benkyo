import { Request, Response } from 'express';
import { PublicStatus } from '~/schemas';
import {
    createDeckService,
    deleteDeckService,
    getAllDecksService,
    getAllRequestedPublicDecksService,
    getDeckService,
    sendReqPublicDeckService,
    getPublicDecksService,
    getRequestPulbicDeckService,
    reviewPublicDeckService,
    duplicateDeckService,
    updateDeckFsrsParamsService,
    getDeckStatsService,
    toggleLikeDeckService,
    getLikedDecksByUserService,
    getUserPublicDecksService,
    updateDeckService,
    getDeckStatisticsService
} from '~/services/deckService';
import {
    createDeckValidation,
    updateDeckFsrsParamsValidation,
    updateDeckValidation
} from '~/validations/deckValidation';
import { ErrorCode } from '~/exceptions/root';

export const createDeck = async (req: Request, res: Response) => {
    const deckData = req.body;
    createDeckValidation.parse(deckData);
    const deckId = await createDeckService(req.user.id, deckData);
    res.json(deckId);
};
export const getAllDecks = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await getAllDecksService(userId);
    res.json(result);
};

export const getDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await getDeckService(userId, id);

    res.json(result);
};

export const deleteDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await deleteDeckService(userId, id);
    return res.json({ message: result.message });
};

export const sendReqPublicDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await sendReqPublicDeckService(userId, id);
    return res.json({ message: result.message });
};

export const getPublicDecks = async (req: Request, res: Response) => {
    const result = await getPublicDecksService();
    res.json(result);
};

export const getAllRequestPublicDecks = async (req: Request, res: Response) => {
    const result = await getAllRequestedPublicDecksService();
    res.json(result);
};

export const getUserPublicDecks = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await getUserPublicDecksService(userId);
    res.json(result);
};

export const getRequestPulbicDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await getRequestPulbicDeckService(id);
    if (!result) {
        return res.status(404).json({ message: 'Deck not found' });
    }
    return res.json(result);
};

export const reviewPublicServiceDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!Object.values(PublicStatus).includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const result = await reviewPublicDeckService(id, status, req.user._id, note);
    return res.json({ message: result.message });
};

export const duplicateDeck = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const result = await duplicateDeckService(userId, id);
    return res.json({ message: result.message });
};

export const updateDeckFsrsParams = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const fsrsParams = req.body;
    const validatedParams = updateDeckFsrsParamsValidation.parse(fsrsParams);

    const result = await updateDeckFsrsParamsService(userId, id, validatedParams);
    return res.json({ message: 'FSRS parameters updated successfully', data: result });
};
export const getDeckStats = async (req: Request, res: Response) => {
    const stats = await getDeckStatsService();
    res.json(stats);
};

export const updateDeck = async (req: Request, res: Response) => {
    const { deckId } = req.params;
    const deckData = req.body;
    updateDeckValidation.parse(deckData);
    const updatedDeck = await updateDeckService(req.user.id, deckId, deckData);
    res.json(updatedDeck);
};
export const toggleLikeDeck = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized', code: ErrorCode.UNAUTHORIZED });
    }

    const result = await toggleLikeDeckService(userId, req.params.id);
    return res.json(result);
};
export const getLikedDecksByUser = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized',
            code: ErrorCode.UNAUTHORIZED
        });
    }

    const likedDecks = await getLikedDecksByUserService(userId);
    return res.json(likedDecks);
};

export const getDeckStatistics = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await getDeckStatisticsService(userId, id);
    res.json(result);
};
