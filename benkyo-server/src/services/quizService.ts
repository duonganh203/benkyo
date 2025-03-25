import z from 'zod';
import { Quiz } from '~/schemas';
import { createQuizValidation } from '~/validations/quizValitation';

export const createQuizService = async (
    userId: string,
    deckId: string,
    quizData: z.infer<typeof createQuizValidation>
) => {
    const newQuiz = await new Quiz({
        deck: deckId,
        createdBy: userId,
        createdAt: new Date(),
        questions: quizData
    });

    await newQuiz.save();

    const { _id: id } = newQuiz.toObject();
    return { id };
};
