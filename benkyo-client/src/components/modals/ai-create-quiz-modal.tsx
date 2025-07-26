import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Loader, Sparkles } from 'lucide-react';
import { Quiz } from '@/pages/class-quiz-management';
import useGetUserDecks from '@/hooks/queries/use-get-user-decks';
import { generateQuizFromFlashcards } from '@/utils/genAIQuiz';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';
import { useCreateClassAIQuiz } from '@/hooks/queries/use-create-class-quiz-by-ai';

interface AIQuizModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
    classId?: string;
}

export const AIQuizModal = ({ open, onOpenChange, onSubmit, classId }: AIQuizModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [questionCount, setQuestionCount] = useState('5');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's decks
    const { data: userDecks, isLoading: isLoadingDecks } = useGetUserDecks();

    // Fetch selected deck details
    const { data: selectedDeck } = useGetDeckCards(selectedDeckId);

    const { mutateAsync: createQuiz } = useCreateClassAIQuiz();

    const generateQuiz = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            let generatedQuestions: Array<{
                questionText: string;
                choices: { text: string }[];
                correctAnswer: number;
            }> = [];

            if (selectedDeckId && selectedDeck) {
                const flashcards = selectedDeck.map((card) => ({
                    front: card.front,
                    back: card.back
                }));

                if (flashcards.length < 4) {
                    throw new Error('Selected deck must have at least 4 flashcards to generate a quiz.');
                }

                generatedQuestions = await generateQuizFromFlashcards(flashcards, parseInt(questionCount), difficulty);

                // Ensure choices are properly formatted
                generatedQuestions = generatedQuestions.map((question) => ({
                    ...question,
                    choices: question.choices.map((choice) => (typeof choice === 'string' ? { text: choice } : choice))
                }));
            } else if (customTopic.trim()) {
                generatedQuestions = await generateQuizFromFlashcards(
                    [{ front: customTopic, back: customTopic }],
                    parseInt(questionCount),
                    difficulty
                );

                // Ensure choices are properly formatted
                generatedQuestions = generatedQuestions.map((question) => ({
                    ...question,
                    choices: question.choices.map((choice) => (typeof choice === 'string' ? { text: choice } : choice))
                }));
            }

            const deckName = selectedDeckId
                ? userDecks?.find((deck) => deck._id === selectedDeckId)?.name
                : customTopic;

            const payload = {
                title: title || `${deckName || 'Custom Topic'} Quiz`,
                description: description || `AI-generated quiz about ${deckName || customTopic}`,
                questions: generatedQuestions.map((q) => ({
                    questionText: q.questionText,
                    choices: q.choices.map((c) =>
                        typeof c === 'string' ? { text: c } : typeof c?.text === 'string' ? c : { text: String(c) }
                    ),
                    correctAnswer: q.correctAnswer
                })),
                type: 'ai',
                classId: classId,
                deckId: selectedDeckId
            };

            console.log('Final payload:', payload);

            const savedQuiz = await createQuiz(payload);

            console.log('Quiz created successfully:', savedQuiz);

            onSubmit({
                title: savedQuiz.quiz.title || 'AI Generated Quiz',
                description: savedQuiz.quiz.description || '',
                classId: savedQuiz.quiz.class,
                deck: savedQuiz.quiz.deck || '',
                questions: savedQuiz.quiz.questions.map((q) => ({
                    id: q._id,
                    question: q.questionText,
                    options: q.choices,
                    correctAnswer: q.correctAnswer
                })),
                type: 'ai' as const
            });

            // Reset form
            setTitle('');
            setDescription('');
            setSelectedDeckId('');
            setCustomTopic('');
            setDifficulty('Medium');
            setQuestionCount('5');

            // Close modal
            onOpenChange(false);
        } catch (err) {
            console.error('Error generating quiz:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const canGenerate = (selectedDeckId || customTopic.trim()) && !isGenerating;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-2xl font-bold text-primary'>
                        <Zap className='w-6 h-6' />
                        AI Quiz Generator
                    </DialogTitle>
                    <DialogDescription>
                        Let AI create a quiz for you based on your chosen deck or topic
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
                                <Label className='text-sm font-medium'>Select from Your Decks</Label>
                                <Select
                                    value={selectedDeckId}
                                    onValueChange={(value) => {
                                        setSelectedDeckId(value);
                                        if (value) setCustomTopic('');
                                    }}
                                    disabled={isLoadingDecks}
                                >
                                    <SelectTrigger className='mt-1'>
                                        <SelectValue
                                            placeholder={isLoadingDecks ? 'Loading your decks...' : 'Choose a deck...'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userDecks?.map((deck) => (
                                            <SelectItem key={deck._id} value={deck._id}>
                                                {deck.name}
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
                                            setSelectedDeckId('');
                                        }
                                    }}
                                    placeholder='Enter any topic you want...'
                                    className='mt-1'
                                    disabled={!!selectedDeckId}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generation Settings */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label className='text-sm font-medium'>Difficulty Level</Label>
                            <Select
                                value={difficulty}
                                onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setDifficulty(value)}
                            >
                                <SelectTrigger className='mt-1'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Easy'>Easy</SelectItem>
                                    <SelectItem value='Medium'>Medium</SelectItem>
                                    <SelectItem value='Hard'>Hard</SelectItem>
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

                    {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}

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
