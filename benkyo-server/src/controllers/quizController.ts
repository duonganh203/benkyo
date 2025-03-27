import { Request, Response } from 'express';
import {
    createQuizService,
    getAllQuizAttemptsService,
    getQuizAttemptById,
    getQuizByIdService,
    saveQuizAttemptService
} from '~/services/quizService';
import { createQuizValidation, saveQuizAttemptValidation } from '~/validations/quizValitation';

export const createQuiz = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { deckId, questions } = req.body;
    createQuizValidation.parse({ deckId, questions });
    const quizId = await createQuizService(userId, deckId, questions);
    res.json(quizId);
};

export const getQuizById = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const userId = req.user._id;
    const quiz = await getQuizByIdService(quizId, userId);
    res.json(quiz);
};

export const saveQuizAttempt = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { quizId } = req.params;
    const { quizAttemptData } = req.body;
    saveQuizAttemptValidation.parse(quizAttemptData);
    const quizAttemptId = await saveQuizAttemptService(userId, quizId, quizAttemptData);
    res.json(quizAttemptId);
};

export const getQuizAttemptsById = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { quizAttemptId } = req.params;
    const quizAttempt = await getQuizAttemptById(quizAttemptId, userId);
    res.json(quizAttempt);
};

export const getAllQuizAttempts = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const quizAttempt = await getAllQuizAttemptsService(userId);
    res.json(quizAttempt);
};
