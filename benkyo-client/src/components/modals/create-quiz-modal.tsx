import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { Quiz, Question } from '@/pages/class-quiz-management';
import { useCreateMoocDeckQuiz } from '@/hooks/queries/use-create-mooc-deck-quiz';
import useUpdateClassQuiz from '@/hooks/queries/use-update-class-quiz';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useGetAllMoocs from '@/hooks/queries/use-get-all-mooc-class';
import { useGetMoocDetail } from '@/hooks/queries/use-get-mooc-detail';

interface CreateQuizModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (quiz: Quiz) => void;
    initialData?: Quiz;
    classId?: string;
}

export const CreateQuizModal = ({ open, onOpenChange, onSubmit, initialData, classId }: CreateQuizModalProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [questions, setQuestions] = useState<Question[]>(
        initialData?.questions.map((q) => ({
            ...q,
            options: Array.isArray(q.options)
                ? q.options.map((opt) => (typeof opt === 'string' ? opt : (opt as any).text))
                : []
        })) || []
    );

    const { data: moocsData, isLoading: loadingMoocs } = useGetAllMoocs(classId);
    const [selectedMoocId, setSelectedMoocId] = useState<string>('');
    const [selectedDeckId, setSelectedDeckId] = useState<string>(
        typeof initialData?.deck === 'string' ? initialData.deck : initialData?.deck?._id || ''
    );

    const [availableDecks, setAvailableDecks] = useState<any[]>([]);

    const { data: moocDetail, isLoading: loadingMoocDetail } = useGetMoocDetail(selectedMoocId || '');

    useEffect(() => {
        if (moocDetail?.decks) {
            setAvailableDecks(moocDetail.decks);
        } else {
            setAvailableDecks([]);
        }
        setSelectedDeckId('');
    }, [moocDetail]);

    const createMutation = useCreateMoocDeckQuiz(classId || '');
    const { mutate: updateQuiz } = useUpdateClassQuiz();

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        };
        setQuestions((prev) => [...prev, newQuestion]);
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? { ...q, options: q.options.map((opt, i) => (i === optionIndex ? value : opt)) }
                    : q
            )
        );
    };

    const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));

    const handleSubmit = () => {
        if (!title.trim()) return;
        const validQuestions = questions.filter((q) => q.question.trim() && q.options.every((opt) => opt.trim()));
        if (validQuestions.length === 0) return;

        const payloadQuestions = validQuestions.map((q) => ({
            questionText: q.question,
            choices: q.options.map((opt) => ({ text: opt })),
            correctAnswer: q.correctAnswer
        }));

        // --------------- Edit Mode ----------------
        if (initialData) {
            const finalClassId = initialData.classId || classId || '';
            const finalMoocId = initialData.mooc?._id || '';
            const finalDeckId = initialData.deck?._id || '';
            const finalQuizId = initialData.id;

            updateQuiz(
                {
                    classId: finalClassId,
                    moocId: finalMoocId,
                    deckId: finalDeckId,
                    quizId: finalQuizId,
                    data: {
                        title: title.trim(),
                        description: description.trim(),
                        deckId: finalDeckId,
                        questions: payloadQuestions
                    }
                },
                {
                    onSuccess: () => {
                        onSubmit({
                            ...initialData,
                            title: title.trim(),
                            description: description.trim(),
                            questions: validQuestions,
                            deck: initialData.deck,
                            mooc: initialData.mooc
                        });
                        onOpenChange(false);
                    }
                }
            );
            return;
        }

        // --------------- Create Mode ----------------
        if (!selectedMoocId || !selectedDeckId) return;

        createMutation.mutate(
            {
                moocId: selectedMoocId,
                deckId: selectedDeckId,
                title: title.trim(),
                description: description.trim(),
                type: 'manual',
                questions: payloadQuestions
            },
            {
                onSuccess: (res) => {
                    const created = res?.data;
                    const createdDeck = availableDecks.find((d) => d.deck._id === selectedDeckId)?.deck;

                    onSubmit({
                        id: created?._id || Date.now().toString(),
                        title: title.trim(),
                        description: description.trim(),
                        classId: classId || '',
                        createdAt: created ? new Date(created.createdAt) : new Date(),
                        type: 'manual',
                        deck: createdDeck,
                        mooc: { _id: selectedMoocId, title: title },
                        questions: validQuestions
                    });

                    onOpenChange(false);
                    setTitle('');
                    setDescription('');
                    setQuestions([]);
                    setSelectedMoocId('');
                    setSelectedDeckId('');
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='text-2xl font-bold text-primary'>
                        {initialData ? 'Edit Quiz' : 'Create New Quiz'}
                    </DialogTitle>
                    <DialogDescription>{initialData ? 'Update your quiz' : 'Build a custom quiz'}</DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Mooc + Deck Selectors */}
                    {!initialData && (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <Label>Select Mooc</Label>
                                <Select onValueChange={(v) => setSelectedMoocId(v)} value={selectedMoocId}>
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
                                    onValueChange={(v) => setSelectedDeckId(v)}
                                    value={selectedDeckId}
                                    disabled={!selectedMoocId || loadingMoocDetail}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Choose Deck' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDecks?.map((d: any) => (
                                            <SelectItem key={d.deck._id} value={d.deck._id}>
                                                {d.deck.title || d.deck.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Title + Description */}
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='title'>Quiz Title</Label>
                            <Input
                                id='title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Enter quiz title...'
                                className='mt-1'
                            />
                        </div>
                        <div>
                            <Label htmlFor='description'>Description</Label>
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

                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <h3>Questions</h3>
                            <Button onClick={addQuestion} size='sm'>
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
                                {questions.map((q, idx) => (
                                    <Card key={q.id}>
                                        <CardHeader className='flex flex-row justify-between'>
                                            <CardTitle>Question {idx + 1}</CardTitle>
                                            <Button
                                                onClick={() => removeQuestion(q.id)}
                                                variant='destructive'
                                                size='icon'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <Label>Question</Label>
                                            <Textarea
                                                value={q.question}
                                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                                rows={2}
                                                placeholder='Enter your question...'
                                                className='mt-1'
                                            />
                                            <Label className='mt-2'>Answer Options</Label>
                                            {q.options.map((opt, i) => (
                                                <div key={i} className='flex gap-2 items-center mt-1'>
                                                    <input
                                                        type='radio'
                                                        name={`correct-${q.id}`}
                                                        checked={q.correctAnswer === i}
                                                        onChange={() => updateQuestion(q.id, 'correctAnswer', i)}
                                                    />
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => updateOption(q.id, i, e.target.value)}
                                                        placeholder={`Option ${i + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className='flex justify-end gap-3 pt-4 border-t'>
                        <Button variant='outline' onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} className='bg-primary hover:bg-primary-hover'>
                            <Save className='w-4 h-4 mr-2' />
                            {initialData ? 'Update Quiz' : 'Create Quiz'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
