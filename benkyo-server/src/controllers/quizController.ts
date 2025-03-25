import { Request, Response } from 'express';
import { createQuizService } from '~/services/quizService';
import { createQuizValidation } from '~/validations/quizValitation';

export const createQuiz = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { deckId, questions } = req.body;
    createQuizValidation.parse({ deckId, questions });
    const quizId = await createQuizService(userId, deckId, questions);
    res.json(quizId);
};
