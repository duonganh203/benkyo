import { model, Schema } from 'mongoose';

const QuestionSchema = new Schema({
    text: { type: String, require: true },
    options: [{ type: String }],
    keywords: [{ type: String }],
    correctAnswerIndex: [{ type: Number }]
});
const QuizSchema = new Schema({
    title: { type: String, require: true },
    description: { type: String },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }]
});

const QuizResultSchema = new Schema({
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    takeDate: { type: Date, default: Date.now },
    score: { type: Number }
});
export const Question = model('Question', QuestionSchema);
export const Quiz = model('Quiz', QuizSchema);
export const QuizResult = model('QuizResult', QuizResultSchema);
