import { Request, Response } from 'express';
import {
    createMoocService,
    getAllMoocsService,
    getMoocByIdService,
    updateMoocService,
    deleteMoocService,
    enrollUserService,
    updateProgressService,
    updateDeckProgressForUserService
} from '~/services/moocService';
export const createMooc = async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { title, description, decks, isPaid, price, currency, publicStatus, locked } = req.body;
    const ownerId = req.user.id;

    const result = await createMoocService({
        title,
        description,
        owner: ownerId,
        class: classId,
        decks,
        isPaid,
        price,
        currency,
        publicStatus,
        locked
    });

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.message,
            error: result.error || null
        });
    }

    return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
    });
};

export const getAllMoocs = async (req: Request, res: Response) => {
    const { classId } = req.params;
    const result = await getAllMoocsService(classId as string);
    res.status(200).json(result);
};

export const getMoocById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const mooc = await getMoocByIdService(id, userId);

    if (!mooc.success) {
        return res.status(404).json({
            success: false,
            message: mooc.message,
            data: null
        });
    }

    return res.status(200).json({
        success: true,
        message: mooc.message,
        data: mooc.data
    });
};
export const updateMooc = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
        return res.status(400).json({
            success: false
        });
    }

    const updatedMooc = await updateMoocService(id, data);

    if (!updatedMooc) {
        return res.status(404).json({
            success: false
        });
    }

    return res.status(200).json({
        success: true,
        data: updatedMooc
    });
};

export const deleteMooc = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'You need to log in to delete the mooc.'
        });
    }

    const result = await deleteMoocService(id, userId);

    if (!result.success) {
        return res.status(400).json(result);
    }
    return res.status(200).json(result);
};

export const enrollUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;

    const result = await enrollUserService(id, userId);

    res.status(200).json(result);
};

export const updateProgress = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, deckId, completed } = req.body;

    const result = await updateProgressService(id, userId, deckId, completed);

    res.status(200).json({ data: result });
};

export const updateDeckProgressForUser = async (req: Request, res: Response) => {
    const { moocId, deckId } = req.params;
    const userId = req.user._id;
    const { lastSeenIndex, totalCards } = req.body;

    const result = await updateDeckProgressForUserService(moocId, userId, deckId, lastSeenIndex, totalCards);

    return res.json(result);
};
