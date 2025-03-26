import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '@/types/quiz';

interface QuizCardProps {
    question: Question;
    onAnswer: (option: number) => void;
    selectedOption: number | null;
    currentQuestion: number;
    totalQuestions: number;
}
const QuizCard = ({ question, onAnswer, selectedOption, currentQuestion, totalQuestions }: QuizCardProps) => {
    const handleOptionSelect = (option: number) => {
        onAnswer(option);
    };

    const getOptionClass = (option: number) => {
        if (selectedOption === null) {
            return 'hover:border-primary/50 hover:bg-primary/5';
        }

        return selectedOption === option
            ? 'border-primary bg-blue-300 text-white'
            : 'hover:border-primary/50 hover:bg-primary/5';
    };

    return (
        <Card className='animate-scale-in w-full transition-300'>
            <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                        Question {currentQuestion} of {totalQuestions}
                    </span>
                </div>
                <CardTitle className='text-xl mt-2'>{question.questionText}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-4'>
                {question.choices.map((option, index) => (
                    <div
                        key={index}
                        className={`p-4 border rounded-md cursor-pointer transition-300 ${getOptionClass(index)}`}
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
