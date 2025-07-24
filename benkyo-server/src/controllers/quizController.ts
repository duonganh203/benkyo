import { Request, Response } from 'express';
import {
    createClassQuizService,
    createQuizService,
    deleteQuizService,
    getAllQuizAttemptsService,
    getClassQuizzesService,
    getQuizAttemptById,
    getQuizByIdService,
    saveQuizAttemptService,
    updateQuizService
} from '~/services/quizService';
import { createQuizValidation, saveQuizAttemptValidation, updateQuizValidation } from '~/validations/quizValitation';

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

export const createClassQuiz = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { _id: classId } = req.params;

    const quiz = await createClassQuizService(userId, classId, req.body);
    res.status(201).json({ quiz });
};

export const getClassQuizzes = async (req: Request, res: Response) => {
    const { _id: classId } = req.params;
    const quizzes = await getClassQuizzesService(classId);
    return res.json(quizzes);
};

export const updateClassQuizzes = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { quizId } = req.params;
    const updatedData = req.body;

    updateQuizValidation.parse(updatedData);
    const result = await updateQuizService(userId, quizId, updatedData);
    res.json(result);
};

export const deleteClassQuizzes = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { quizId } = req.params;

    const result = await deleteQuizService(userId, quizId);
    res.json({ message: 'Quiz deleted successfully', ...result });
};
