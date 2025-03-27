import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '@/types/quiz';
import { useRef } from 'react';

interface QuizCardProps {
    question: Question;
    onAnswer: (option: number) => void;
    selectedOption: number | null;
    currentQuestion: number;
    totalQuestions: number;
    id: string;
}

const QuizCard = ({ question, onAnswer, selectedOption, currentQuestion, totalQuestions, id }: QuizCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleOptionSelect = (option: number) => {
        onAnswer(option);

        if (currentQuestion < totalQuestions) {
            setTimeout(() => {
                const nextCard = document.getElementById(`quiz-question-${currentQuestion + 1}`);
                if (nextCard) {
                    nextCard.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 300);
        }
    };

    const getOptionClass = (option: number) => {
        if (selectedOption === null) {
            return 'hover:border-blue-500 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-blue-950';
        }

        return selectedOption === option
            ? 'border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/50'
            : 'hover:border-blue-500 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-blue-950';
    };

    return (
        <Card
            ref={cardRef}
            id={id}
            className='animate-scale-in w-full transition-300 dark:bg-gray-900 dark:border-gray-800 scroll-mt-8'
        >
            <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground dark:text-gray-400'>
                        Question {currentQuestion} of {totalQuestions}
                    </span>
                </div>
                <CardTitle className='text-xl mt-2 dark:text-white'>{question.questionText}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-4'>
                {question.choices.map((option, index) => (
                    <div
                        key={index}
                        className={`p-4 border rounded-md cursor-pointer transition-300 dark:border-gray-700 dark:text-gray-200 ${getOptionClass(index)}`}
                        onClick={() => handleOptionSelect(index)}
                    >
                        {option.text}
                    </div>
                ))}
            </CardContent>
            <CardFooter className='flex justify-between pt-2'></CardFooter>
        </Card>
    );
};

export default QuizCard;
