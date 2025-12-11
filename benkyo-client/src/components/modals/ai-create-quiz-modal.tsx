import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Loader } from 'lucide-react';
import { Quiz } from '@/pages/class-quiz-management';
import { generateQuizFromFlashcards } from '@/utils/genAIQuiz';
import useGetAllMoocs from '@/hooks/queries/use-get-all-mooc-class';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateMoocDeckQuiz } from '@/hooks/queries/use-create-mooc-deck-quiz';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';

interface AIQuizModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
    classId?: string;
}

export const AIQuizModal = ({ open, onOpenChange, onSubmit, classId }: AIQuizModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMoocId, setSelectedMoocId] = useState('');
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [questionCount, setQuestionCount] = useState('5');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: moocsData, isLoading: loadingMoocs } = useGetAllMoocs(classId);
    const { data: moocDetail, isLoading: loadingMoocDetail } = useGetMoocDetail(selectedMoocId || '');
    const { data: cardsData } = useGetDeckCards(selectedDeckId || '');
    const [availableDecks, setAvailableDecks] = useState<any[]>([]);

    const queryClient = useQueryClient();
    const createMutation = useCreateMoocDeckQuiz(classId || '');
    const { mutateAsync: createQuiz } = createMutation;

    useEffect(() => {
        if (moocDetail?.decks) setAvailableDecks(moocDetail.decks);
        else setAvailableDecks([]);

        setSelectedDeckId('');
    }, [moocDetail]);

    const generateQuiz = async () => {
        if (!selectedMoocId || !selectedDeckId) {
            setError('Please select both a Mooc and a Deck.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const flashcards =
                cardsData?.map((card: any) => ({
                    front: card.front,
                    back: card.back
                })) || [];

            if (flashcards.length < 4) {
                throw new Error('Selected deck must have at least 4 flashcards.');
            }

            const selectedDeck = availableDecks.find((d) => d.deck._id === selectedDeckId)?.deck;

            let generatedQuestions = await generateQuizFromFlashcards(
                flashcards,
                parseInt(questionCount, 10),
                difficulty,
                'mcq'
            );

            generatedQuestions = generatedQuestions.map((q: any) => ({
                ...q,
                choices: q.choices.map((c: any) => (typeof c === 'string' ? { text: c } : c))
            }));

            const payload = {
                moocId: selectedMoocId,
                deckId: selectedDeckId,
                title: title || `${selectedDeck?.name || 'AI'} Quiz`,
                description: description || `AI-generated quiz from ${selectedDeck?.name}`,
                type: 'ai',
                questions: generatedQuestions.map((q: any) => ({
                    questionText: q.questionText,
                    choices: q.choices.map((c: any) => ({ text: c.text })),
                    correctAnswer: q.correctAnswer
                }))
            };

            const saved = await createQuiz(payload);
            queryClient.invalidateQueries({ queryKey: ['getClassQuizzes', classId] });

            const quizResp = (saved?.data || saved) ?? {};

            onSubmit({
                title: quizResp.title || payload.title,
                description: quizResp.description || payload.description,
                classId: quizResp.classId || classId || '',
                type: 'ai',
                mooc: {
                    _id: quizResp.moocId || selectedMoocId,
                    title: moocDetail?.title || ''
                },
                deck: {
                    _id: quizResp.deckId || selectedDeckId,
                    name: selectedDeck?.name || ''
                },
                questions: (quizResp.questions || payload.questions).map((q: any) => ({
                    id: q._id ?? q.questionText.slice(0, 10),
                    question: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                }))
            });

            // Reset form
            setTitle('');
            setDescription('');
            setSelectedMoocId('');
            setSelectedDeckId('');
            setDifficulty('Medium');
            setQuestionCount('5');
            onOpenChange(false);
        } catch (err) {
            console.error('Error generating quiz:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate quiz.');
        } finally {
            setIsGenerating(false);
        }
    };

    const canGenerate = !isGenerating && !!selectedMoocId && !!selectedDeckId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-2xl font-bold text-primary'>
                        <Zap className='w-6 h-6' /> AI Quiz Generator
                    </DialogTitle>
                    <DialogDescription>Let AI generate quiz questions from your chosen Mooc Deck.</DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Select Mooc and Deck */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label>Select Mooc</Label>
                            <Select value={selectedMoocId} onValueChange={(v) => setSelectedMoocId(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingMoocs ? 'Loading...' : 'Choose Mooc'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {moocsData?.data?.map((m) => (
                                        <SelectItem key={m._id} value={m._id}>
                                            {m.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Select Deck</Label>
                            <Select
                                value={selectedDeckId}
                                onValueChange={(v) => setSelectedDeckId(v)}
                                disabled={!selectedMoocId || loadingMoocDetail}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Choose Deck' />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDecks?.map((d) => (
                                        <SelectItem key={d.deck._id} value={d.deck._id}>
                                            {d.deck.name || d.deck.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Title + Description */}
                    <div className='space-y-4'>
                        <div>
                            <Label>Quiz Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Optional title...'
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Optional description...'
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label>Difficulty</Label>
                            <Select
                                value={difficulty}
                                onValueChange={(v: 'Easy' | 'Medium' | 'Hard') => setDifficulty(v)}
                            >
                                <SelectTrigger>
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
                            <Label>Question Count</Label>
                            <Select value={questionCount} onValueChange={setQuestionCount}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='3'>3</SelectItem>
                                    <SelectItem value='5'>5</SelectItem>
                                    <SelectItem value='10'>10</SelectItem>
                                    <SelectItem value='15'>15</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}

                    <div className='flex justify-end gap-3 pt-4 border-t'>
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
                                    <Loader className='w-4 h-4 mr-2 animate-spin' /> Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className='w-4 h-4 mr-2' /> Generate Quiz
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
