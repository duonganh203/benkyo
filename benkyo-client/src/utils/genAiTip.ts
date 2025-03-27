import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;
const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY || '');
export const ANALYZE_QUIZ_PERFORMANCE_PROMPT = `
You are an assistant specialized in analyzing multiple-choice quiz results. Based on the quiz performance data below, evaluate strengths, weaknesses, and suggest ways to improve knowledge.  

## **Quiz Data**  
- **Total Questions:** {totalQuestions}  
- **Correct Answers:** {correctAnswers}  
- **Accuracy Rate:** {accuracy}%  

## **Evaluation Guidelines**  
1. **Analyze Strengths**  
   - Identify correctly answered questions and comment on what the user likely understands well.  
   - If the user scores less than 30%, emphasize the need for significant improvement.  

2. **Analyze Weaknesses**  
   - Identify common mistakes, such as:  
     - Frequently choosing the wrong type of answer.  
     - Selecting the first option without careful consideration.  
     - Misunderstanding key concepts.  
   - If the incorrect answer rate is too high (>70%), highlight the need to review basic concepts.  

3. **Suggest Ways to Improve**  
   - Recommend study materials (official documentation, online courses, etc.).  
   - Provide strategies for answering multiple-choice questions effectively (eliminating incorrect options, carefully reading questions).  
   - Suggest hands-on practice through projects or exercises.  

## **Example Output**  
\`\`\`json
{
  title: "JavaScript Quiz Analysis",
    analysis: {
      items: ["Total questions: 10", "Correct answers: 4", "Accuracy rate: 40%"],
    },
    strengths: {
      title: "Strengths",
      items: [
        {
          icon: "check",
          content:
            "Good understanding of JavaScript basics: You correctly answered questions about variables and data types.",
        },
        {
          icon: "check",
          content:
            "Familiar with array methods: You demonstrated knowledge of common array operations like map and filter.",
        },
      ],
    },
    weaknesses: {
      title: "Areas for Improvement",
      items: [
        {
          icon: "x",
          content:
            "Limited understanding of closures and scope: You missed questions related to these advanced concepts.",
        },
        {
          icon: "x",
          content:
            "Confusion with asynchronous JavaScript: Questions about Promises and async/await were challenging for you.",
        },
      ],
    },
    tips: {
      title: "Improvement Tips",
      items: [
        {
          icon: "tip",
          content:
            "1. Study closures and scope\n\nReview the MDN documentation on closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures\n\nPractice with examples to understand lexical scoping.",
        },
        {
          icon: "tip",
          content:
            "2. Practice asynchronous JavaScript\n\nWork through tutorials on Promises and async/await.\n\nBuild small projects that use fetch API or other asynchronous operations.",
        },
        {
          icon: "tip",
          content:
            "3. Take more focused quizzes\n\nUse platforms like JavaScript.info or FreeCodeCamp to practice specific concepts.",
        },
        {
          icon: "tip",
          content:
            "4. Apply concepts in real projects\n\nCreate small applications that incorporate the concepts you're learning.\n\nReview and refactor your code to improve understanding.",
        },
      ],
    },
}
    
\`\`\`  
Analyze the following quiz results and return the output in JSON format following the structure above.  

## **Input Data**  
\`\`\`json
{
  "totalQuestions": 10,
  "correctAnswers": 2,
  "accuracy": 20,
  "responses": [
    { "questionIndex": 0, "selectedChoice": 0 },
    { "questionIndex": 1, "selectedChoice": 0 },
    { "questionIndex": 2, "selectedChoice": 0 },
    { "questionIndex": 3, "selectedChoice": 0 },
    { "questionIndex": 4, "selectedChoice": 2 },
    { "questionIndex": 5, "selectedChoice": 1 },
    { "questionIndex": 6, "selectedChoice": 2 },
    { "questionIndex": 7, "selectedChoice": 0 },
    { "questionIndex": 8, "selectedChoice": 2 },
    { "questionIndex": 9, "selectedChoice": 1 }
  ]
}
\`\`\`
`;

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: ANALYZE_QUIZ_PERFORMANCE_PROMPT
});

// interface QuizResponse {
//     questionIndex: number;
//     selectedChoice: number;
// }

// interface QuizData {
//     totalQuestions: number;
//     correctAnswers: number;
//     responses: QuizResponse[];
// }

export async function analyzeQuizPerformance(quizAttempt: any): Promise<any> {
    if (!quizAttempt || !quizAttempt.totalQuestions || quizAttempt.correctAnswers === undefined) {
        throw new Error('Invalid quiz attempt data.');
    }

    const accuracy = ((quizAttempt.correctAnswers / quizAttempt.totalQuestions) * 100).toFixed(2);

    // Chuyển đổi dữ liệu về định dạng AI yêu cầu
    const processedQuizData = {
        totalQuestions: quizAttempt.totalQuestions,
        correctAnswers: quizAttempt.correctAnswers,
        accuracy: parseFloat(accuracy),
        responses: quizAttempt.quiz.questions.map((question: any, index: number) => ({
            questionIndex: index,
            questionText: question.questionText,
            choices: question.choices.map((choice: any) => choice.text),
            correctAnswer: question.choices[question.correctAnswer].text,
            selectedChoice:
                quizAttempt.responses[index] !== undefined
                    ? question.choices[quizAttempt.responses[index].selectedChoice]?.text || 'No answer provided'
                    : 'No answer provided',
            isCorrect: quizAttempt.responses[index]?.selectedChoice === question.correctAnswer
        }))
    };

    const prompt = `
  Analyze the following quiz results and return the output in JSON format.

  ## **Quiz Data**  
  - **Total Questions:** ${processedQuizData.totalQuestions}  
  - **Correct Answers:** ${processedQuizData.correctAnswers}  
  - **Accuracy Rate:** ${processedQuizData.accuracy}%  

  ${ANALYZE_QUIZ_PERFORMANCE_PROMPT}

  ## **Input Data**  
  \`\`\`json
  ${JSON.stringify(processedQuizData, null, 2)}
  \`\`\`
  `;

    try {
        const response = await model.generateContent([prompt]);
        const responseText = response.response.text();

        const jsonMatch =
            responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || responseText.match(/\{([\s\S]*)\}/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        const analysis = JSON.parse(jsonString);

        return analysis;
    } catch (error) {
        console.error('Error analyzing quiz performance:', error);
        throw new Error('Failed to analyze quiz performance.');
    }
}
