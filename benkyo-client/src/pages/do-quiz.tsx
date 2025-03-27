import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QuizCard from '@/components/quiz-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useGetQuizId from '@/hooks/queries/use-get-quiz-id';
import { getToast } from '@/utils/getToast';
import useSaveQuizAttempt from '@/hooks/queries/use-create-quiz-attempt';
import { Badge } from '@/components/ui/badge';

const Quiz = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { data: quiz, isLoading } = useGetQuizId(quizId!);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [quizStarted, setQuizStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState('');
    const { mutateAsync: saveQuizAttempt } = useSaveQuizAttempt();

    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }

        if (timeLeft === 0 && quizStarted) {
            handleSubmitQuiz(true);
        }
    }, [quizStarted, timeLeft]);

    const handleAnswer = (questionText: string, selectedOption: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionText]: selectedOption
        }));
    };
    const startQuiz = () => {
        if (!quiz) {
            getToast('error', 'Quiz not found. Please try again!');

            return;
        }
        setQuizStarted(true);
        setStartTime(new Date().toISOString());
        setTimeLeft(quiz.questions.length * 60);
    };

    const handleSubmitQuiz = (autoSubmit = false) => {
        if (!autoSubmit && Object.keys(answers).length < quiz!.questions.length!) {
            getToast('error', 'Please answer all questions before submitting!');
            return;
        }
        if (!quiz) {
            getToast('error', 'Quiz not found. Please try again!');
            return;
        }

        const correctAnswers = quiz.questions.filter(
            (question) => question.correctAnswer === answers[question.questionText]
        ).length;
        const quizAttemptData = {
            quizId: quizId!,
            startTime: startTime,
            endTime: new Date().toISOString(),
            totalQuestions: quiz.questions.length,
            correctAnswers: correctAnswers,
            responses: quiz.questions.map((question) => ({
                questionIndex: quiz.questions.indexOf(question),
                selectedChoice: answers[question.questionText] ?? -1
            }))
        };
        saveQuizAttempt(quizAttemptData, {
            onSuccess: (data) => {
                getToast('success', 'Quiz submitted successfully!');
                navigate(`/quiz/attempt/${data.id}`);
            },
            onError: (error) => {
                getToast('error', 'Failed to submit quiz. Please try again!');
                console.error(error);
            }
        });
    };

    if (isLoading) {
        return (
            <div className='min-h-screen flex flex-col dark:bg-gray-950'>
                <main className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4'>
                    <div className='mb-6 w-full max-w-3xl'>
                        <div className='flex items-center justify-between'>
                            <Skeleton className='w-24 h-8 rounded-md dark:bg-gray-800' />
                            <Skeleton className='w-40 h-8 rounded-md dark:bg-gray-800' />
                            <div className='w-[88px]'></div>
                        </div>
                    </div>

                    <div className='max-w-lg w-full p-8 rounded-xl animate-scale-in flex flex-col items-center text-center dark:bg-gray-900'>
                        <Skeleton className='w-48 h-6 mb-4 dark:bg-gray-800' />
                        <Skeleton className='w-64 h-4 mb-6 dark:bg-gray-800' />
                        <Skeleton className='w-32 h-10 rounded-md dark:bg-gray-800' />
                    </div>
                </main>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className='min-h-screen flex flex-col dark:text-white'>
                <main className='container flex-1 py-8 px-4 md:px-6 flex flex-col items-center justify-center'>
                    <h2 className='text-2xl font-medium mb-4'>Quiz not found</h2>
                    <Button asChild>
                        <Link to={`/my-decks`}>Back to Home</Link>
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex flex-col  dark:text-white'>
            <main className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4'>
                <div className='mb-6 w-full max-w-3xl'>
                    <div className='flex items-center justify-between'>
                        <Button
                            variant='outline'
                            asChild
                            className='transition-300 dark:border-gray-700 dark:hover:bg-gray-800'
                        >
                            <Link to={`/deck/${quiz.deck._id}`}>Back to Deck</Link>
                        </Button>
                        <h1 className='text-2xl font-medium animate-fade-in'>{quiz.deck.name} Quiz</h1>
                        <div className='w-[88px]'></div>
                    </div>
                </div>

                {!quizStarted ? (
                    <div className='max-w-lg w-full p-8 rounded-xl animate-scale-in flex flex-col items-center text-center dark:bg-gray-900 dark:border dark:border-gray-800'>
                        <h2 className='text-2xl font-medium mb-4'>Ready to Test Your Knowledge?</h2>
                        <p className='text-muted-foreground dark:text-gray-400 mb-6'>
                            You'll be presented with {quiz.questions.length} multiple-choice questions based on your
                            flashcards.
                        </p>
                        <Button onClick={startQuiz} size='lg' className='transition-300'>
                            Start Quiz
                        </Button>
                    </div>
                ) : (
                    <div className='w-full flex flex-col items-center max-w-3xl'>
                        <div className='mb-6 flex justify-between w-full px-4 py-2 rounded-full bg-blue-50 border-blue-500 border-1 dark:bg-blue-950 dark:border-blue-800'>
                            <span className='font-medium'>Total Questions: {quiz.questions.length}</span>
                            <Badge className='font-medium text-red-600 bg-white dark:bg-gray-900 dark:text-red-400'>
                                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </Badge>
                        </div>

                        {quiz.questions.map((question, index) => (
                            <div key={question.questionText} className='w-full mb-8'>
                                <QuizCard
                                    id={`quiz-question-${index + 1}`}
                                    question={question}
                                    onAnswer={(selectedOption: number) =>
                                        handleAnswer(question.questionText, selectedOption)
                                    }
                                    currentQuestion={index + 1}
                                    totalQuestions={quiz.questions.length}
                                    selectedOption={answers[question.questionText] ?? null}
                                />
                            </div>
                        ))}

                        <Button onClick={() => handleSubmitQuiz()} size='lg' className='transition-300 mt-4 mb-12'>
                            Submit Quiz
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Quiz;
