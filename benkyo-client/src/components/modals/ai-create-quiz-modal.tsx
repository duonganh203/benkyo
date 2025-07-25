import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Loader, Sparkles } from 'lucide-react';
import { Quiz, Question } from '@/pages/class-quiz-management';

interface AIQuizModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
}

const sampleDecks = [
    'Mathematics Fundamentals',
    'Science Basics',
    'History Overview',
    'Language Arts',
    'Geography Essentials',
    'Physics Concepts',
    'Chemistry Basics',
    'Biology Introduction'
];

export const AIQuizModal = ({ open, onOpenChange, onSubmit }: AIQuizModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDeck, setSelectedDeck] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState('5');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateQuiz = async () => {
        setIsGenerating(true);

        // Simulate AI generation with sample questions
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const topic = customTopic || selectedDeck;
        const sampleQuestions: Question[] = [
            {
                id: '1',
                question: `What is a fundamental concept in ${topic}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 1
            },
            {
                id: '2',
                question: `Which statement best describes ${topic}?`,
                options: ['Statement 1', 'Statement 2', 'Statement 3', 'Statement 4'],
                correctAnswer: 0
            },
            {
                id: '3',
                question: `How does ${topic} apply in real-world scenarios?`,
                options: ['Application A', 'Application B', 'Application C', 'Application D'],
                correctAnswer: 2
            }
        ];

        const generatedQuiz = {
            title: title || `${topic} Quiz`,
            description: description || `AI-generated quiz covering ${topic} concepts`,
            questions: sampleQuestions.slice(0, parseInt(questionCount)),
            type: 'ai' as const,
            deck: topic,
            classId: ''
        };

        setIsGenerating(false);
        onSubmit(generatedQuiz);

        // Reset form
        setTitle('');
        setDescription('');
        setSelectedDeck('');
        setCustomTopic('');
        setDifficulty('medium');
        setQuestionCount('5');
    };

    const canGenerate = (selectedDeck || customTopic.trim()) && !isGenerating;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-2xl font-bold text-primary'>
                        <Zap className='w-6 h-6' />
                        AI Quiz Generator
                    </DialogTitle>
                    <DialogDescription>
                        Let AI create a quiz for you based on your chosen topic or deck
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Quiz Basics */}
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='ai-title' className='text-base font-medium'>
                                Quiz Title (Optional)
                            </Label>
                            <Input
                                id='ai-title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Leave blank to auto-generate...'
                                className='mt-1'
                            />
                        </div>

                        <div>
                            <Label htmlFor='ai-description' className='text-base font-medium'>
                                Description (Optional)
                            </Label>
                            <Textarea
                                id='ai-description'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Leave blank to auto-generate...'
                                className='mt-1'
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Topic Selection */}
                    <Card className='bg-gradient-to-r from-quiz-primary/5 to-quiz-info/5 border-quiz-primary/20'>
                        <CardContent className='p-4 space-y-4'>
                            <div className='flex items-center gap-2 mb-2'>
                                <Sparkles className='w-5 h-5 text-quiz-primary' />
                                <h3 className='font-semibold text-quiz-primary'>Choose Your Topic</h3>
                            </div>

                            <div>
                                <Label className='text-sm font-medium'>Select from Deck</Label>
                                <Select value={selectedDeck} onValueChange={setSelectedDeck}>
                                    <SelectTrigger className='mt-1'>
                                        <SelectValue placeholder='Choose a pre-made deck...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sampleDecks.map((deck) => (
                                            <SelectItem key={deck} value={deck}>
                                                {deck}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='text-center text-sm text-muted-foreground'>OR</div>

                            <div>
                                <Label className='text-sm font-medium'>Custom Topic</Label>
                                <Input
                                    value={customTopic}
                                    onChange={(e) => {
                                        setCustomTopic(e.target.value);
                                        if (e.target.value.trim()) {
                                            setSelectedDeck('');
                                        }
                                    }}
                                    placeholder='Enter any topic you want...'
                                    className='mt-1'
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generation Settings */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label className='text-sm font-medium'>Difficulty Level</Label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className='mt-1'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='easy'>Easy</SelectItem>
                                    <SelectItem value='medium'>Medium</SelectItem>
                                    <SelectItem value='hard'>Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className='text-sm font-medium'>Number of Questions</Label>
                            <Select value={questionCount} onValueChange={setQuestionCount}>
                                <SelectTrigger className='mt-1'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='3'>3 Questions</SelectItem>
                                    <SelectItem value='5'>5 Questions</SelectItem>
                                    <SelectItem value='10'>10 Questions</SelectItem>
                                    <SelectItem value='15'>15 Questions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-3 justify-end pt-4 border-t'>
                        <Button variant='outline' onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={generateQuiz}
                            disabled={!canGenerate}
                            className='bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                        >
                            {isGenerating ? (
                                <>
                                    <Loader className='w-4 h-4 mr-2 animate-spin' />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className='w-4 h-4 mr-2' />
                                    Generate Quiz
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
