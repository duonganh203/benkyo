import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import useGetQuizAttempt from '@/hooks/queries/use-get-quiz-attempt';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const QuizResults = () => {
    const navigate = useNavigate();

    const { quizAttemptId } = useParams<{ quizAttemptId: string }>();
    const { data: quizAttempt, isLoading } = useGetQuizAttempt(quizAttemptId!);

    if (!quizAttempt) {
        return <div>Quiz Attempt does not exist</div>;
    }

    const percentage = Math.round((quizAttempt.score / quizAttempt.totalQuestions) * 100);

    const getScoreMessage = () => {
        if (percentage === 100) return 'Perfect score! Amazing job!';
        if (percentage >= 80) return "Excellent work! You're doing great!";
        if (percentage >= 60) return 'Good job! Keep practicing to improve.';
        if (percentage >= 40) return 'Nice effort! Keep studying to improve.';
        return 'Keep practicing to improve your score.';
    };

    return (
        <div className='glass max-w-3xl w-full flex flex-col justify-center mx-auto p-8 rounded-xl animate-scale-in'>
            <h2 className='text-2xl font-bold mb-4 text-center'>Quiz Results</h2>

            <div className='mb-8 text-center'>
                <div className='text-3xl font-bold mb-2'>
                    {quizAttempt.score} / {quizAttempt.totalQuestions} ({percentage}%)
                </div>
                <p className='text-muted-foreground'>{getScoreMessage()}</p>
            </div>

            <div className='w-full mb-8'>
                <h3 className='font-medium text-xl mb-4'>Question Review</h3>
                <Accordion type='single' collapsible className='w-full space-y-3'>
                    {quizAttempt.quiz.questions.map((result, index) => {
                        const isCorrect = result.correctAnswer === quizAttempt.responses[index].selectedChoice;
                        const userAnswer = result.choices[quizAttempt.responses[index].selectedChoice].text;
                        const correctAnswer = result.choices[result.correctAnswer].text;

                        return (
                            <AccordionItem
                                key={index}
                                value={`question-${index}`}
                                className='border rounded-lg bg-background px-0 overflow-hidden'
                            >
                                <AccordionTrigger className='px-4 py-3 hover:no-underline'>
                                    <div className='flex items-start gap-3 text-left'>
                                        {isCorrect ? (
                                            <CheckCircle className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
                                        ) : (
                                            <XCircle className='h-5 w-5 text-destructive mt-0.5 flex-shrink-0' />
                                        )}
                                        <div className='font-medium'>
                                            Question {index + 1}: {result.questionText}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className='px-4 pb-4 pt-0 border-t'>
                                    <div className='pt-3 space-y-3'>
                                        <div className='p-3 rounded bg-muted/50'>
                                            <div className='text-sm font-medium mb-1'>Your Answer:</div>
                                            <div className={isCorrect ? 'text-green-600' : 'text-destructive'}>
                                                {userAnswer}
                                            </div>
                                        </div>

                                        {!isCorrect && (
                                            <div className='p-3 rounded bg-muted/50'>
                                                <div className='text-sm font-medium mb-1'>Correct Answer:</div>
                                                <div className='text-green-600'>{correctAnswer}</div>
                                            </div>
                                        )}

                                        <div className='text-sm text-muted-foreground mt-2'>
                                            {isCorrect
                                                ? 'Great job! You got this question right.'
                                                : 'Keep studying this concept to improve your understanding.'}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>

            <div className='flex space-x-4'>
                <Button
                    onClick={() => {
                        navigate(`/do-quiz/${quizAttempt.quiz._id}`);
                    }}
                    className='transition-300'
                >
                    Restart Quiz
                </Button>
                <Button asChild variant='outline' className='transition-300'>
                    <Link to={`/home}`}>Back to Deck</Link>
                </Button>
            </div>
        </div>
    );
};

export default QuizResults;
