import { Request, Response } from 'express';
import { NotFoundException } from '~/exceptions/notFound';
import { ErrorCode } from '~/exceptions/root';
import { UnprocessableEntity } from '~/exceptions/unprocessableEntity';
import { Quiz, QuizResult } from '~/schemas/quizSchema';
import { Question } from '~/schemas/quizSchema';
import { User } from '~/schemas/userSchema';

export const getQuizes = async (req: Request, res: Response) => {
    const quizes = await Quiz.find({}).populate('questions');
    res.render('quiz/index', { quizes });
};

export const updateQuiz = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(id, { title, description }, { new: true, runValidators: true }).populate(
        'questions'
    );
    res.json(quiz);
};

export const delQuiz = async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    res.json(deletedQuiz);
};

export const findQuiz = async (req: Request, res: Response) => {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) throw new NotFoundException('Quiz not found!', ErrorCode.NOT_FOUND);
    const questions = await Question.find({
        _id: { $in: quiz.questions },
        text: { $regex: 'sink', $options: 'i' }
    });
    const quizFilter = {
        ...quiz.toObject(),
        questions: questions
    };
    res.json(quizFilter);
};

export const addQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text, options, correctAnswerIndex } = req.body;
    if (!text || !options) throw new UnprocessableEntity(null, 'Invalid input data', ErrorCode.UNPROCESSALE_ENTITY);
    const question = await Question.create({ text, options, correctAnswerIndex });
    const quiz = await Quiz.findByIdAndUpdate(id, { $push: { questions: question._id } }).populate('questions');
    res.json(quiz);
};

export const addManyQuestions = async (req: Request, res: Response) => {
    const { id } = req.params;
    const questionsData = req.body;
    if (!Array.isArray(questionsData) || questionsData.length === 0)
        throw new UnprocessableEntity(null, 'Invalid input data', ErrorCode.UNPROCESSALE_ENTITY);
    const questions = await Question.insertMany(questionsData);
    const quesIds = questions.map((question) => question._id);
    const quiz = await Quiz.findByIdAndUpdate(id, { $push: { questions: { $each: quesIds } } }).populate('questions');
    res.json(quiz);
};

export const doQuiz = async (req: Request, res: Response) => {
    const { id: quizId } = req.params;
    const { answers } = req.body;
    const user = await User.findById(req.user._id);
    const quiz = await Quiz.findById(quizId).populate('questions');
    let score = 0;
    for (let i = 0; i < quiz!.questions.length; i++) {
        const question = quiz!.questions[i];
        const cai = question instanceof Question ? question.correctAnswerIndex : [0];
        const userAnswer = answers[i];
        if (Array.isArray(cai)) {
            if (Array.isArray(userAnswer)) {
                const allCorrect = cai.every((cI) => userAnswer.includes(cI));
                if (allCorrect) score++;
            }
        }
    }

    const quizResult = new QuizResult({
        quiz: quizId,
        user: req.user._id,
        score
    });

    await quizResult.save();

    user!.quizResultList.push(quizResult._id);
    await user!.save();
    res.json(quizResult);
};

export const takeQuiz = async (req: Request, res: Response) => {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).populate('questions');
    if (!quiz) throw new NotFoundException('Quiz not found!', ErrorCode.INCORRECT_PASSWORD);
    res.render('quiz/take', { quiz });
};

export const showResult = async (req: Request, res: Response) => {
    const { id } = req.params;
    const quizResult = await QuizResult.findById(id);
    if (!quizResult) throw new NotFoundException('Result not found!', ErrorCode.INTERNAL_SERVER_ERROR);
    res.render('quiz/result', { quizResult });
};
