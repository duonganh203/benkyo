import mongoose from 'mongoose';
import z from 'zod';
import { ForbiddenRequestsException } from '~/exceptions/forbiddenRequests';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { Class, Mooc, Quiz, QuizAttempt } from '~/schemas';
import { QuizResponse } from '~/types/classTypes';
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

export const updateQuizForMoocDeckService = async (
    userId: string,
    classId: string,
    moocId: string,
    deckId: string,
    quizId: string,
    updatedData: z.infer<typeof createQuizValidation>
) => {
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    if (!classDoc.owner.equals(userId)) {
        throw new ForbiddenRequestsException('Only the class owner can update quizzes', ErrorCode.FORBIDDEN);
    }

    const mooc = await Mooc.findById(moocId);
    if (!mooc) {
        throw new NotFoundException('Mooc not found', ErrorCode.NOT_FOUND);
    }

    if (mooc.class?.toString() !== classId) {
        throw new NotFoundException('Mooc does not belong to this class', ErrorCode.NOT_FOUND);
    }

    const deckInMooc = mooc.decks.find((d) => d.deck.toString() === deckId);
    if (!deckInMooc) {
        throw new NotFoundException('Deck not found in this Mooc', ErrorCode.NOT_FOUND);
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);
    }

    if (
        quiz.class?.toString() !== classId ||
        quiz.mooc?.toString() !== moocId ||
        quiz.moocDeck?.toString() !== deckId
    ) {
        throw new ForbiddenRequestsException(
            'This quiz does not belong to the specified Mooc or Deck',
            ErrorCode.FORBIDDEN
        );
    }

    updateQuizValidation.parse(updatedData);

    if (updatedData.title !== undefined) quiz.title = updatedData.title;
    if (updatedData.description !== undefined) quiz.description = updatedData.description;
    if (updatedData.questions !== undefined) quiz.set('questions', updatedData.questions);
    if (updatedData.type !== undefined) quiz.type = updatedData.type;

    await quiz.save();
    return { id: quiz._id };
};

export const getClassQuizzesService = async (classId: string, moocId?: string) => {
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    if (moocId) {
        const mooc = await Mooc.findById(moocId);
        if (!mooc) {
            throw new NotFoundException('Mooc not found', ErrorCode.NOT_FOUND);
        }

        if (mooc.class?.toString() !== classId) {
            throw new NotFoundException('Mooc does not belong to this class', ErrorCode.NOT_FOUND);
        }
    }

    const filter: any = { class: new mongoose.Types.ObjectId(classId) };
    if (moocId) {
        filter.mooc = new mongoose.Types.ObjectId(moocId);
    }

    const quizzes = await Quiz.find(filter)
        .populate('mooc', 'title')
        .populate('moocDeck', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

    return quizzes;
};

export const deleteQuizForMoocDeckService = async (userId: string, classId: string, quizId: string) => {
    const [quiz, classDoc] = await Promise.all([Quiz.findById(quizId), Class.findById(classId)]);

    if (!classDoc) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    if (!classDoc.owner.equals(userId)) {
        throw new ForbiddenRequestsException('Only the class owner can delete quizzes', ErrorCode.FORBIDDEN);
    }

    if (!quiz) {
        throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);
    }

    await Quiz.deleteOne({ _id: quizId });

    return { id: quizId };
};

export const createQuizForMoocDeckService = async (
    userId: string,
    classId: string,
    moocId: string,
    deckId: string,
    quizData: z.infer<typeof createQuizValidation>
) => {
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
        throw new NotFoundException('Class not found', ErrorCode.NOT_FOUND);
    }

    if (!classDoc.owner.equals(userId)) {
        throw new ForbiddenRequestsException('Only the class owner can create quizzes', ErrorCode.FORBIDDEN);
    }

    const mooc = await Mooc.findById(moocId);
    if (!mooc) {
        throw new NotFoundException('Mooc not found', ErrorCode.NOT_FOUND);
    }

    if (mooc.class?.toString() !== classId) {
        throw new NotFoundException('Mooc does not belong to this class', ErrorCode.NOT_FOUND);
    }

    const deckInMooc = mooc.decks.find((d) => d.deck.toString() === deckId);
    if (!deckInMooc) {
        throw new NotFoundException('Deck not found in this Mooc', ErrorCode.NOT_FOUND);
    }

    const newQuiz = new Quiz({
        class: classId,
        mooc: moocId,
        moocDeck: deckId,
        createdBy: userId,
        title: quizData.title,
        description: quizData.description,
        type: quizData.type,
        questions: quizData.questions,
        createdAt: new Date()
    });

    await newQuiz.save();

    return newQuiz;
};

export const getQuizzesByDeckService = async (classId: string, moocId: string, deckId: string) => {
    const mooc = await Mooc.findById(moocId);
    if (!mooc) {
        throw new NotFoundException('Mooc not found', ErrorCode.NOT_FOUND);
    }

    if (mooc.class?.toString() !== classId) {
        throw new NotFoundException('Mooc does not belong to this class', ErrorCode.NOT_FOUND);
    }

    const deckInMooc = mooc.decks.find((d) => d.deck.toString() === deckId);
    if (!deckInMooc) {
        throw new NotFoundException('Deck not found in this Mooc', ErrorCode.NOT_FOUND);
    }

    const quizzes = await Quiz.find({
        class: classId,
        mooc: moocId,
        moocDeck: deckId
    }).sort({ createdAt: -1 });

    return quizzes;
};

export const submitClassQuizAttemptService = async (
    userId: string,
    classId: string,
    moocId: string,
    deckId: string,
    quizId: string,
    responses: QuizResponse[]
) => {
    const mooc = await Mooc.findById(moocId);
    const quiz = await Quiz.findById(quizId);

    if (!mooc) throw new NotFoundException('Mooc not found', ErrorCode.NOT_FOUND);
    if (!quiz) throw new NotFoundException('Quiz not found', ErrorCode.NOT_FOUND);

    let correctAnswers = 0;
    responses.forEach((res) => {
        const question = (quiz.questions || []).find((q: any) => q._id.toString() === String(res.questionId));
        if (question && question.correctAnswer === res.selectedChoice) {
            correctAnswers++;
        }
    });

    const totalQuestions = (quiz.questions || []).length || 0;
    const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const attempt = new QuizAttempt({
        user: userId,
        quiz: quizId,
        totalQuestions,
        correctAnswers,
        responses,
        startTime: new Date(),
        endTime: new Date()
    });
    await attempt.save();

    return { attempt, scorePercent };
};
