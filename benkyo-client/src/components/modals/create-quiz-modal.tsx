import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { Quiz, Question } from '@/pages/class-quiz-management';

interface CreateQuizModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
    initialData?: Quiz;
}

export const CreateQuizModal = ({ open, onOpenChange, onSubmit, initialData }: CreateQuizModalProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? { ...q, options: q.options.map((opt, i) => (i === optionIndex ? value : opt)) }
                    : q
            )
        );
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const handleSubmit = () => {
        if (!title.trim() || questions.length === 0) return;

        const validQuestions = questions.filter((q) => q.question.trim() && q.options.every((opt) => opt.trim()));

        if (validQuestions.length === 0) return;

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            questions: validQuestions,
            type: initialData?.type || 'manual'
        });

        // Reset form only if not editing
        if (!initialData) {
            setTitle('');
            setDescription('');
            setQuestions([]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='text-2xl font-bold text-primary'>
                        {initialData ? 'Edit Quiz' : 'Create New Quiz'}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Update your quiz details and questions'
                            : 'Build a custom quiz with your own questions and answers'}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Quiz Details */}
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='title' className='text-base font-medium'>
                                Quiz Title
                            </Label>
                            <Input
                                id='title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Enter quiz title...'
                                className='mt-1'
                            />
                        </div>

                        <div>
                            <Label htmlFor='description' className='text-base font-medium'>
                                Description
                            </Label>
                            <Textarea
                                id='description'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Describe what this quiz covers...'
                                className='mt-1'
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>Questions</h3>
                            <Button onClick={addQuestion} size='sm' className='bg-secondary hover:bg-secondary/90'>
                                <Plus className='w-4 h-4 mr-2' />
                                Add Question
                            </Button>
                        </div>

                        {questions.length === 0 ? (
                            <Card className='p-8 text-center border-dashed'>
                                <p className='text-muted-foreground mb-4'>No questions added yet</p>
                                <Button onClick={addQuestion} variant='outline'>
                                    <Plus className='w-4 h-4 mr-2' />
                                    Add Your First Question
                                </Button>
                            </Card>
                        ) : (
                            <div className='space-y-4'>
                                {questions.map((question, index) => (
                                    <Card key={question.id} className='shadow-sm'>
                                        <CardHeader className='pb-3'>
                                            <div className='flex items-center justify-between'>
                                                <CardTitle className='text-base'>Question {index + 1}</CardTitle>
                                                <Button
                                                    onClick={() => removeQuestion(question.id)}
                                                    variant='destructive'
                                                    size='sm'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <div>
                                                <Label className='text-sm font-medium'>Question</Label>
                                                <Textarea
                                                    value={question.question}
                                                    onChange={(e) =>
                                                        updateQuestion(question.id, 'question', e.target.value)
                                                    }
                                                    placeholder='Enter your question...'
                                                    className='mt-1'
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label className='text-sm font-medium mb-2 block'>Answer Options</Label>
                                                <div className='space-y-2'>
                                                    {question.options.map((option, optionIndex) => (
                                                        <div key={optionIndex} className='flex items-center gap-2'>
                                                            <input
                                                                type='radio'
                                                                name={`correct-${question.id}`}
                                                                checked={question.correctAnswer === optionIndex}
                                                                onChange={() =>
                                                                    updateQuestion(
                                                                        question.id,
                                                                        'correctAnswer',
                                                                        optionIndex
                                                                    )
                                                                }
                                                                className='text-primary'
                                                            />
                                                            <Input
                                                                value={option}
                                                                onChange={(e) =>
                                                                    updateOption(
                                                                        question.id,
                                                                        optionIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder={`Option ${optionIndex + 1}...`}
                                                                className='flex-1'
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className='text-xs text-muted-foreground mt-1'>
                                                    Select the radio button next to the correct answer
                                                </p>
                                            </div>

                                            <div>
                                                <Label className='text-sm font-medium'>Explanation (Optional)</Label>
                                                <Textarea
                                                    value={question.explanation || ''}
                                                    onChange={(e) =>
                                                        updateQuestion(question.id, 'explanation', e.target.value)
                                                    }
                                                    placeholder='Explain why this is the correct answer...'
                                                    className='mt-1'
                                                    rows={2}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className='flex gap-3 justify-end pt-4 border-t'>
                        <Button variant='outline' onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!title.trim() || questions.length === 0}
                            className='bg-primary hover:bg-primary-hover'
                        >
                            <Save className='w-4 h-4 mr-2' />
                            {initialData ? 'Update Quiz' : 'Create Quiz'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
