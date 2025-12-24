import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY || '');

const QUIZ_TYPE_PROMPT = `
You will generate quiz questions in one of the following formats:

1. Multiple Choice (mcq)
{
  "questionText": "...",
  "choices": [
    { "text": "..." },
    { "text": "..." },
    { "text": "..." },
    { "text": "..." }
  ],
  "correctAnswer": 0-3
}

2. True / False (true_false)
{
  "questionText": "...",
  "answer": true | false
}

3. Fill in the Blank (fill_blank)
{
  "questionText": "... ___ ...",
  "choices": [
    { "text": "..." },
    { "text": "..." },
    { "text": "..." },
    { "text": "..." },
  ],
  "correctAnswer": 0-3
}

4. Short Answer (short_answer)
{
  "questionText": "...",
  "choices": [
    { "text": "..." },
    { "text": "..." },
    { "text": "..." },
    { "text": "..." },
  ],
  "correctAnswer": 0-3
}

STRICT RULES:
- Output ONLY valid JSON
- Return exactly the requested number of questions
`;

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite'
});

function convertToMCQ(parsed: any[], quizType: string) {
    return parsed.map((q) => {
        if (quizType === 'mcq') return q;

        if (quizType === 'true_false') {
            return {
                questionText: q.questionText,
                choices: [{ text: 'True' }, { text: 'False' }, { text: 'Not given' }, { text: 'Unknown' }],
                correctAnswer: q.answer ? 0 : 1
            };
        }

        if (quizType === 'fill_blank') {
            return {
                questionText: q.questionText,
                choices: q.choices,
                correctAnswer: q.correctAnswer
            };
        }

        if (quizType === 'short_answer') {
            return {
                questionText: q.questionText,
                choices: q.choices,
                correctAnswer: q.correctAnswer
            };
        }

        return q;
    });
}

export async function generateQuizFromFlashcards(
    flashcards: Array<{ front: string; back: string }>,
    numQuestions: number,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    quizType: string
) {
    const prompt = `
Generate a quiz of type "${quizType}"
Difficulty: ${difficulty}
Number of questions: ${numQuestions}

Flashcards:
${JSON.stringify(flashcards)}

${QUIZ_TYPE_PROMPT}
`;

    const res = await model.generateContent([prompt]);
    const text = res.response.text().trim();

    const match = text.match(/```json([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/) || text.match(/\[([\s\S]*)\]/);

    const jsonString = match ? match[1].trim() : text;
    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (err) {
        throw new Error('AI returned invalid JSON.');
    }

    const mcqQuestions = convertToMCQ(parsed, quizType);

    return mcqQuestions;
}
