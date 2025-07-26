import mongoose from 'mongoose';
import z from 'zod';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, Quiz, QuizAttempt } from '~/schemas';
import { createQuizValidation, saveQuizAttemptValidation, updateQuizValidation } from '~/validations/quizValitation';

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

export const createClassQuizService = async (
    userId: string,
    classId: string,
    quizData: z.infer<typeof createQuizValidation> & { deck: string }
) => {
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    if (!classDoc.owner.equals(userId)) {
        throw new ForbiddenRequestsException('Only the class owner can create quizzes', ErrorCode.FORBIDDEN);
    }

    const newQuiz = new Quiz({
        class: classId,
        title: quizData.title,
        description: quizData.description,
        createdBy: userId,
        createdAt: new Date(),
        questions: quizData.questions.map((q) => ({
            questionText: q.questionText,
            choices: q.choices.map((c) => (typeof c === 'string' ? c : c.text)),
            correctAnswer: q.correctAnswer
        }))
    });

    await newQuiz.save();

    return newQuiz;
};

export const getClassQuizzesService = async (classId: string) => {
    const quizzes = await Quiz.find({ class: new mongoose.Types.ObjectId(classId) })
        .populate('deck', 'name')
        .populate('createdBy', 'name');
    return quizzes;
};

export const updateQuizService = async (
    userId: string,
    quizId: string,
    updatedData: z.infer<typeof createQuizValidation>
) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);
    }

    if (!quiz.createdBy.equals(userId)) {
        throw new ForbiddenRequestsException('You do not have permission to update this quiz', ErrorCode.FORBIDDEN);
    }

    updateQuizValidation.parse(updatedData);

    if (updatedData.title !== undefined) {
        quiz.title = updatedData.title;
    }

    if (updatedData.description !== undefined) {
        quiz.description = updatedData.description;
    }

    if (updatedData.questions !== undefined) {
        quiz.set('questions', updatedData.questions);
    }
    await quiz.save();

    return { id: quiz._id };
};

export const deleteQuizService = async (userId: string, quizId: string) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);
    }

    if (!quiz.createdBy.equals(userId)) {
        throw new ForbiddenRequestsException('You do not have permission to delete this quiz', ErrorCode.FORBIDDEN);
    }

    await Quiz.findByIdAndDelete(quizId);

    await QuizAttempt.deleteMany({ quiz: quizId });

    return { id: quizId };
};
