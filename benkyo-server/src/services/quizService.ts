import z from 'zod';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Quiz, QuizAttempt } from '~/schemas';
import { createQuizValidation, saveQuizAttemptValidation } from '~/validations/quizValitation';

export const createQuizService = async (
    userId: string,
    deckId: string,
    quizData: z.infer<typeof createQuizValidation>
) => {
    const newQuiz = new Quiz({
        deck: deckId,
        createdBy: userId,
        createdAt: new Date(),
        questions: quizData
    });

    await newQuiz.save();

    const { _id: id } = newQuiz.toObject();
    return { id };
};

export const getQuizByIdService = async (quizId: string, userId: string) => {
    const quiz = await Quiz.findById(quizId).populate('deck', 'name');
    if (!quiz) {
        throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);
    }
    if (!quiz.createdBy.equals(userId)) {
        throw new ForbiddenRequestsException('You dont have permission to view this Quiz', ErrorCode.FORBIDDEN);
    }
    return quiz;
};

export const saveQuizAttemptService = async (
    userId: string,
    quizId: string,
    quizAttempData: z.infer<typeof saveQuizAttemptValidation>
) => {
    const { startTime, endTime, totalQuestions, correctAnswers, responses } = quizAttempData;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);
    }
    if (!quiz.createdBy.equals(userId)) {
        throw new ForbiddenRequestsException('You dont have permission to do this Quiz', ErrorCode.FORBIDDEN);
    }
    const quizAttempt = new QuizAttempt({
        quiz: quizId,
        user: userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalQuestions,
        correctAnswers,
        responses
    });
    await quizAttempt.save();
    const { _id: id } = quizAttempt.toObject();
    return { id };
};

export const getQuizAttemptById = async (quizAttemptId: string, userId: string) => {
    const quizAttempt = await QuizAttempt.findById(quizAttemptId).populate({
        path: 'quiz',
        populate: {
            path: 'deck',
            select: 'name'
        }
    });

    if (!quizAttempt) {
        throw new NotFoundException('Quiz attempt not found', ErrorCode.NOT_FOUND);
    }
    if (!quizAttempt.user.equals(userId)) {
        throw new ForbiddenRequestsException('You dont have permission to view this Quiz attempt', ErrorCode.FORBIDDEN);
    }

    return quizAttempt;
};

export const getAllQuizAttemptsService = async (userId: string) => {
    const quizAllAttempt = await QuizAttempt.find({ user: userId }).populate({
        path: 'quiz',
        populate: {
            path: 'deck',
            select: 'name'
        }
    });

    return quizAllAttempt;
};
