import z from 'zod';

export const createQuizValidation = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    type: z.enum(['manual', 'ai']).default('manual').optional(),
    deckId: z.string().min(1, 'Deck ID is required'),
    questions: z
        .array(
            z.object({
                questionText: z.string().min(1, 'Question text is required'),
                choices: z
                    .array(
                        z.object({
                            text: z.string().min(1, 'Choice text is required')
                        })
                    )
                    .min(2, 'At least two choices are required'),
                correctAnswer: z.number().int().min(0, 'Correct answer must be at least 0')
            })
        )
        .min(1, 'At least one question is required')
});

export const saveQuizAttemptValidation = z.object({
    startTime: z.string(),
    endTime: z.string(),
    totalQuestions: z.number().int().min(1, 'Total questions must be at least 5'),
    correctAnswers: z.number().int().min(0, 'Correct answers must be at least 0'),
    responses: z
        .array(
            z.object({
                questionIndex: z.number().int().min(0, 'Question index must be at least 0'),
                selectedChoice: z.number().int().min(-1, 'Selected choice must be at least 0')
            })
        )
        .min(1, 'At least one response is required')
});

export const updateQuizValidation = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    questions: z
        .array(
            z.object({
                questionText: z.string().min(1, 'Question text is required'),
                choices: z
                    .array(
                        z.object({
                            text: z.string().min(1, 'Choice text is required')
                        })
                    )
                    .min(2, 'At least two choices are required'),
                correctAnswer: z.number().int().min(0, 'Correct answer must be at least 0')
            })
        )
        .min(1, 'At least one question is required')
});
