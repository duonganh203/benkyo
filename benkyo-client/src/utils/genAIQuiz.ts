import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY || '');
const GENERATE_QUIZ_PROMPT = `
You are tasked with generating a multiple-choice quiz based on provided flashcards. Follow these rules:

1. **Each question must have four answer choices.**  
2. **Each answer choice must have:**
   - **text** (string) → The answer option.
3. **Store the index (0-3) of the correct answer instead of using boolean flags.**
   - **correctAnswer** (number) → The index of the correct answer within the choices array.
4. **Use the given difficulty level to adjust complexity:**
   - **Easy:** Clearly distinct incorrect answers.
   - **Medium:** Incorrect answers should be somewhat similar.
   - **Hard:** Incorrect answers should be highly deceptive, resembling the correct one.
5. **Return the output strictly in JSON format as an array of objects with the following structure:**
   - **questionText** (string)
   - **choices** (array of 4 objects, each with "text")
   - **correctAnswer** (number)

**Example:**
\`\`\`json
[
  {
    "questionText": "What is the process by which plants convert sunlight into energy?",
    "choices": [
      { "text": "Respiration" },
      { "text": "Fermentation" },
      { "text": "Photosynthesis" },
      { "text": "Transpiration" }
    ],
    "correctAnswer": 2
  }
]
\`\`\`
`;

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: GENERATE_QUIZ_PROMPT
});

export async function generateQuizFromFlashcards(
    flashcards: Array<{ front: string; back: string }>,
    numQuestions: number,
    difficulty: 'Easy' | 'Medium' | 'Hard'
): Promise<Array<{ questionText: string; choices: { text: string }[]; correctAnswer: number }>> {
    if (flashcards.length < 4) {
        throw new Error('At least 4 flashcards are required to generate a quiz.');
    }

    try {
        const prompt = `
        Generate EXACTLY ${numQuestions} multiple-choice questions. DO NOT RETURN LESS THAN ${numQuestions}.
        ${JSON.stringify(flashcards)}

        The difficulty level for this quiz is: ${difficulty}

        ${GENERATE_QUIZ_PROMPT}
        `;

        const res = await model.generateContent([prompt]);

        const responseText = res.response.text();

        try {
            const jsonMatch =
                responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || responseText.match(/\[([\s\S]*)\]/);

            const jsonString = jsonMatch ? jsonMatch[1] : responseText;
            const quizQuestions = JSON.parse(jsonString);

            if (
                Array.isArray(quizQuestions) &&
                quizQuestions.every(
                    (q) =>
                        typeof q === 'object' &&
                        'questionText' in q &&
                        'choices' in q &&
                        Array.isArray(q.choices) &&
                        q.choices.length === 4 &&
                        q.choices.every((c: any) => 'text' in c) &&
                        'correctAnswer' in q &&
                        Number.isInteger(q.correctAnswer) &&
                        q.correctAnswer >= 0 &&
                        q.correctAnswer < 4
                )
            ) {
                return quizQuestions;
            } else {
                throw new Error('Invalid quiz structure');
            }
        } catch (error) {
            console.error('Failed to parse JSON response:', error);
            console.log('Raw response:', responseText);
            throw new Error('Failed to generate valid quiz questions');
        }
    } catch (error) {
        console.error('Error generating quiz:', error);
        throw error;
    }
}
