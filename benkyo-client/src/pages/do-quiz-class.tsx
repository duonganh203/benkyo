import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import useGetQuizzesByDeck from '@/hooks/queries/use-get-quizzes-by-deck';

type Choice = { _id: string; text: string };
type Question = {
    _id: string;
    questionText: string;
    choices: Choice[];
    correctAnswer: number;
};
type Quiz = {
    _id: string;
    title: string;
    description?: string;
    questions: Question[];
};

const resolveQuizzes = (raw: unknown): Quiz[] | null => {
    if (!raw) return null;
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
        return raw as Quiz[];
    }
    if (typeof raw === 'object' && raw !== null && 'data' in raw) {
        const maybe = (raw as any).data;
        if (Array.isArray(maybe)) return maybe as Quiz[];
    }
    return null;
};

const QuizTakingPage: React.FC = () => {
    const { classId, moocId, deckId, quizId } = useParams<{
        classId: string;
        moocId: string;
        deckId: string;
        quizId?: string;
    }>();
    const navigate = useNavigate();

    const { data: rawData, isError } = useGetQuizzesByDeck(classId ?? '', moocId ?? '', deckId ?? '') as {
        data?: unknown;
        isError: boolean;
    };

    const quizzes = resolveQuizzes(rawData);
    const quiz: Quiz | null =
        quizzes && quizzes.length > 0
            ? quizId
                ? (quizzes.find((q) => q._id === quizId) ?? quizzes[0])
                : quizzes[0]
            : null;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [finished, setFinished] = useState(false);

    if (isError || !quiz) {
        return (
            <div className='flex min-h-screen items-center justify-center px-4'>
                <Card className='p-6 text-center max-w-lg'>
                    <div className='flex justify-center gap-4'>
                        <Button onClick={() => navigate(-1)} variant='outline'>
                            Quay lại
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;
    const currentQuestion = quiz.questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

    const handleAnswerSelect = (choiceIndex: number) => {
        if (isAnswered) return;
        setSelectedAnswer(choiceIndex);
        setIsAnswered(true);

        if (choiceIndex === currentQuestion.correctAnswer) {
            setScore((s) => s + 1);
        }

        setTimeout(() => {
            if (currentIndex + 1 < totalQuestions) {
                setCurrentIndex((i) => i + 1);
                setSelectedAnswer(null);
                setIsAnswered(false);
            } else {
                setFinished(true);
            }
        }, 1200);
    };

    const handleBack = () => navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);
    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setIsAnswered(false);
        setFinished(false);
    };

    return (
        <div className='min-h-screen bg-background px-4 py-8'>
            <div className='max-w-3xl mx-auto'>
                <Button variant='ghost' className='mb-4 flex items-center gap-2' onClick={handleBack}>
                    <ArrowLeft className='w-4 h-4' /> Back to Quiz Hub
                </Button>

                <Card className='shadow-elevated border-primary/20'>
                    <CardHeader>
                        <CardTitle className='text-2xl font-bold text-center'>{quiz.title}</CardTitle>
                    </CardHeader>

                    <CardContent className='space-y-6'>
                        {!finished ? (
                            <>
                                {/* Progress */}
                                <div>
                                    <p className='text-sm text-muted-foreground mb-2 text-right'>
                                        {currentIndex + 1} / {totalQuestions}
                                    </p>
                                    <Progress value={progressPercent} className='h-2' />
                                </div>

                                {/* Question */}
                                <h2 className='text-xl font-semibold mb-4'>{currentQuestion.questionText}</h2>

                                {/* Choices */}
                                <div className='grid grid-cols-1 gap-3'>
                                    {currentQuestion.choices.map((choice: Choice, index: number) => {
                                        const isCorrect = index === currentQuestion.correctAnswer;
                                        const isSelected = index === selectedAnswer;
                                        const variant = !isAnswered
                                            ? 'outline'
                                            : isSelected
                                              ? isCorrect
                                                  ? 'outline'
                                                  : 'destructive'
                                              : 'outline';
                                        const addedClass =
                                            isAnswered && isSelected
                                                ? isCorrect
                                                    ? 'bg-green-50 border-green-400 text-green-800'
                                                    : 'bg-red-50 border-red-400 text-red-800'
                                                : 'hover:bg-primary/5';

                                        return (
                                            <Button
                                                key={choice._id}
                                                onClick={() => handleAnswerSelect(index)}
                                                variant={variant as any} // cast because variant union is limited
                                                className={`justify-start text-left h-auto py-3 ${addedClass}`}
                                            >
                                                {choice.text}
                                                {isAnswered &&
                                                    isSelected &&
                                                    (isCorrect ? (
                                                        <CheckCircle className='ml-auto w-5 h-5 text-green-500' />
                                                    ) : (
                                                        <XCircle className='ml-auto w-5 h-5 text-red-500' />
                                                    ))}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            // Finish view
                            <div className='text-center space-y-4'>
                                <h2 className='text-3xl font-bold mb-2'>🎉 Hoàn thành!</h2>
                                <p className='text-muted-foreground'>
                                    Bạn trả lời đúng <span className='font-semibold text-primary'>{score}</span> /{' '}
                                    {totalQuestions} câu.
                                </p>

                                <div className='text-2xl font-bold'>
                                    Điểm: {Math.round((score / totalQuestions) * 100)}%
                                </div>

                                <div className='flex justify-center gap-4 mt-6'>
                                    <Button onClick={handleRestart} variant='outline'>
                                        Làm lại
                                    </Button>
                                    <Button onClick={handleBack}>Quay lại Hub</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default QuizTakingPage;
