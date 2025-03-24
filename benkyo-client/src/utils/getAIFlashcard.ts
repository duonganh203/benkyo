import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY || '');
export const GENERATE_FLASHCARD_PROMPT = `
You are tasked with generating flashcards that adhere to the principles outlined in SuperMemo's "20 Rules for Formulating Knowledge." These rules focus on creating effective and memorable flashcards. Here are the key guidelines for creating these flashcards:

1. **Clarity and Simplicity:** Ensure each flashcard is clear and concise. Avoid complex language and focus on simplicity to aid understanding and retention.

2. **Single Concept Per Card:** Each flashcard should focus on a single concept or piece of information to prevent cognitive overload.

3. **Use of Images and Examples:** Where applicable, incorporate images or examples to enhance understanding and memory retention.

4. **Question and Answer Format:** Structure each flashcard in a question and answer format to facilitate active recall.

5. **Avoid Ambiguity:** Ensure that the questions and answers are unambiguous, providing clear and precise information.

6. **Relevance and Context:** Provide context where necessary to make the information relevant and easier to understand.

7. **Bidirectional Learning:** If the user requests, generate flashcards in both directions (e.g., "What is the capital of France?" and "Paris is the capital of which country?").

8. **Simple Translations:** For simple word translations, generate straightforward flashcards without overthinking the formulation.

**Example Flashcard:**

- **front:** What is the process by which plants convert sunlight into chemical energy?
- **back:** Photosynthesis.

- THE OUTPUT MUST BE JSON FORMAT AND THE OUTPUT MUST BE AN ARRAY OF OBJECTS AND EACH OBJECT MUST HAVE A FRONT AND BACK PROPERTY
**Instructions for the Model:**

- Generate flashcards that adhere to the above guidelines.
- For simple translations, provide direct and straightforward flashcards.
- If bidirectional learning is requested, create two separate flashcards to cover both directions of learning.`;

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: GENERATE_FLASHCARD_PROMPT
});

export async function generateFlashcardsFromFile(
    file: File,
    numCards: number = 10
): Promise<Array<{ front: string; back: string }>> {
    try {
        const fileData = await fileToBase64(file);

        const prompt = `Create ${numCards} concise and effective flashcards from this document. Focus on the most important concepts, facts, or relationships. Each flashcard should have a clear question on the front and a concise answer on the back.`;

        const res = await model.generateContent([
            {
                inlineData: {
                    data: fileData,
                    mimeType: file.type
                }
            },
            prompt
        ]);

        const responseText = res.response.text();

        try {
            const jsonMatch =
                responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || responseText.match(/\[([\s\S]*)\]/);

            const jsonString = jsonMatch ? jsonMatch[1] : responseText;
            const flashcards = JSON.parse(jsonString);

            if (
                Array.isArray(flashcards) &&
                flashcards.every((card) => typeof card === 'object' && 'front' in card && 'back' in card)
            ) {
                return flashcards;
            } else {
                throw new Error('Invalid flashcard structure');
            }
        } catch (error) {
            console.error('Failed to parse JSON response:', error);
            console.log('Raw response:', responseText);
            throw new Error('Failed to generate valid flashcards');
        }
    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw error;
    }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
}
