import { Request, Response } from 'express';
import {
    createMoocService,
    getAllMoocsService,
    getMoocByIdService,
    updateMoocService,
    deleteMoocService,
    enrollUserService,
    updateProgressService
} from '~/services/moocService';
export const createMooc = async (req: any, res: Response) => {
    const { classId } = req.params;
    const { title, description, decks, isPaid, price, currency, publicStatus } = req.body;
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
        publicStatus
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

    const mooc = await getMoocByIdService(id);

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

    const updated = await updateMoocService(id, data);
    if (!updated) return res.status(404).json({ data: null });

    res.status(200).json({ data: updated });
};

export const deleteMooc = async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await deleteMoocService(id);

    if (!deleted) return res.status(404).json({ data: null });

    res.status(200).json({ data: deleted });
};

export const enrollUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;

    const result = await enrollUserService(id, userId);

    res.status(200).json({ data: result });
};

export const updateProgress = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId, deckId, completed } = req.body;

    const result = await updateProgressService(id, userId, deckId, completed);

    res.status(200).json({ data: result });
};
