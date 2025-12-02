import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import useGetQuizzesByDeck from '@/hooks/queries/use-get-quizzes-by-deck';
import { QuizHub } from '@/types/quiz';
import { useSubmitQuizAttempt } from '@/hooks/queries/use-submit-quiz-attempt';
import { toast } from 'sonner';
import useMe from '@/hooks/queries/use-me';
import useUpdateMoocProgress from '@/hooks/queries/use-update-mooc-progress';
import { useQueryClient } from '@tanstack/react-query';

type Choice = { _id: string; text: string };
type Quiz = QuizHub;

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

    // Fetch quizzes
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

    // States
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [finished, setFinished] = useState(false);
    const [userResponses, setUserResponses] = useState<{ questionId: string; selectedChoice: number }[]>([]);

    const submitAttempt = useSubmitQuizAttempt(classId ?? '', moocId ?? '', deckId ?? '', quiz?._id ?? '');

    const queryClient = useQueryClient();
    const { data: me } = useMe();
    const updateProgress = useUpdateMoocProgress();

    // Handle answer selection
    const handleAnswerSelect = (choiceIndex: number) => {
        if (isAnswered) return;

        setSelectedAnswer(choiceIndex);
        setIsAnswered(true);

        const question = quiz?.questions[currentIndex];
        if (!question) return;

        const response = { questionId: question._id, selectedChoice: choiceIndex };

        setUserResponses((prev) => [...prev.filter((r) => r.questionId !== question._id), response]);

        if (choiceIndex === question.correctAnswer) {
            setScore((s) => s + 1);
        }

        setTimeout(() => {
            if (currentIndex + 1 < (quiz?.questions.length ?? 0)) {
                setCurrentIndex((i) => i + 1);
                setSelectedAnswer(null);
                setIsAnswered(false);
            } else {
                setFinished(true);
            }
        }, 1000);
    };

    // Submit quiz when finished
    useEffect(() => {
        if (finished && quiz && userResponses.length === quiz.questions.length && me?._id) {
            submitAttempt.mutate(userResponses, {
                onSuccess: async (res: any) => {
                    const message = res?.message || 'Quiz submitted';
                    const isPass = message.toLowerCase().includes('passed');

                    if (isPass) {
                        toast.success('🎉 You passed the quiz!');
                    } else {
                        toast.error('❌ You failed the quiz.');
                    }

                    // Update progress only if passed
                    if (isPass) {
                        await updateProgress.mutateAsync({
                            moocId: moocId!,
                            payload: {
                                userId: me._id,
                                deckId: deckId!,
                                completed: true
                            }
                        });

                        queryClient.invalidateQueries({
                            queryKey: ['mooc-detail', moocId]
                        });
                    }
                },

                onError: () => {
                    toast.error('❌ Failed to submit your quiz. Please try again.');
                }
            });
        }
    }, [finished, quiz, userResponses, me, moocId, deckId]);

    // Navigation
    const handleBack = () => navigate(`/class/${classId}/mooc/${moocId}/deck/${deckId}/quiz-hub`);

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setIsAnswered(false);
        setFinished(false);
        setUserResponses([]);
    };

    // Error or no quiz
    if (isError || !quiz) {
        return (
            <div className='flex min-h-screen items-center justify-center px-4'>
                <Card className='p-6 text-center max-w-lg'>
                    <div className='flex justify-center gap-4'>
                        <Button onClick={() => navigate(-1)} variant='outline'>
                            Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;
    const currentQuestion = quiz.questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

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
                                <div>
                                    <p className='text-sm text-muted-foreground mb-2 text-right'>
                                        {currentIndex + 1} / {totalQuestions}
                                    </p>
                                    <Progress value={progressPercent} className='h-2' />
                                </div>

                                <h2 className='text-xl font-semibold mb-4'>{currentQuestion.questionText}</h2>

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
                                                variant={variant as any}
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
                            <div className='text-center space-y-4'>
                                <h2 className='text-3xl font-bold mb-2'>🎉 Completed!</h2>
                                <p className='text-muted-foreground'>
                                    You answered <span className='font-semibold text-primary'>{score}</span> /{' '}
                                    {totalQuestions} correctly.
                                </p>

                                <div className='text-2xl font-bold'>
                                    Score: {Math.round((score / totalQuestions) * 100)}%
                                </div>

                                <div className='flex justify-center gap-4 mt-6'>
                                    <Button onClick={handleRestart} variant='outline'>
                                        Retry
                                    </Button>
                                    <Button onClick={handleBack}>Back to Hub</Button>
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
