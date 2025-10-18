import { Request, Response } from 'express';
import {
    createQuizForMoocDeckService,
    createQuizService,
    deleteQuizForMoocDeckService,
    getAllQuizAttemptsService,
    getClassQuizzesService,
    getQuizAttemptById,
    getQuizByIdService,
    getQuizzesByDeckService,
    saveQuizAttemptService,
    updateQuizForMoocDeckService
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

export const deleteMoocDeckQuiz = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId, quizId } = req.params;

    const result = await deleteQuizForMoocDeckService(userId, classId, quizId);
};

export const createMoocDeckQuiz = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId } = req.params;
    const { moocId, deckId, questions, title, description, type } = req.body;

    createQuizValidation.parse({ deckId, questions, title, description, type });

    const quiz = await createQuizForMoocDeckService(userId, classId, moocId, deckId, {
        title,
        description,
        type,
        questions,
        deckId
    });

    res.status(201).json({ message: 'Quiz created successfully', quiz });
};

export const getClassQuizzes = async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { moocId } = req.query;

    const quizzes = await getClassQuizzesService(classId, moocId as string | undefined);
    return res.status(200).json(quizzes);
};

export const updateMoocDeckQuiz = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { classId, moocId, deckId, quizId } = req.params;
    const updatedData = req.body;

    const result = await updateQuizForMoocDeckService(userId, classId, moocId, deckId, quizId, updatedData);
    res.status(200).json(result);
};
