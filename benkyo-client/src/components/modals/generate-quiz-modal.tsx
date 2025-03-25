import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useGenerateQuizModal } from '@/hooks/stores/use-generate-quiz-modal';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import useGetDeckCards from '@/hooks/queries/use-get-deck-cards';
import { generateQuizFromFlashcards } from '@/utils/genAIQuiz';
import { getToast } from '@/utils/getToast';
import { useCreateQuiz } from '@/hooks/queries/use-create-quiz';
import { DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

type GenerationStage = 'preparing' | 'analyzing' | 'generating' | 'refining' | 'complete';

export const GenerateQuizModal = () => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStage, setGenerationStage] = useState<GenerationStage>('preparing');
    const [generationProgress, setGenerationProgress] = useState<number>(0);
    const [numQuestions, setNumQuestions] = useState<number>(20);
    const [selectedError, setSelectedError] = useState<string | null>(null);
    const { isOpen, close, deckId } = useGenerateQuizModal((store) => store);
    const { data: cardsData, isLoading: isCardsLoading } = useGetDeckCards(deckId!);
    const { mutateAsync: createQuizMutation } = useCreateQuiz(deckId!);

    const [selected, setSelected] = useState<string>('');
    const difficulties = [
        { label: 'Easy', color: 'green' },
        { label: 'Medium', color: 'blue' },
        { label: 'Hard', color: 'red' }
    ];

    useEffect(() => {
        if (!isGenerating) return;

        const stages: GenerationStage[] = ['preparing', 'analyzing', 'generating', 'refining', 'complete'];
        const stageDurations = [2000, 3000, 3000, 3000, 1000];
        const totalTime = stageDurations.reduce((sum, time) => sum + time, 0);
        let elapsed = 0;

        const updateProgress = () => {
            if (!isGenerating) return;

            elapsed += 100;
            const progressPercent = Math.min((elapsed / totalTime) * 100, 99);
            setGenerationProgress(progressPercent);

            let stageTime = 0;
            for (let i = 0; i < stageDurations.length; i++) {
                stageTime += stageDurations[i];
                if (elapsed < stageTime) {
                    setGenerationStage(stages[i]);
                    break;
                }
            }
        };

        const progressInterval = setInterval(updateProgress, 100);

        return () => clearInterval(progressInterval);
    }, [isGenerating]);

    const getStageDescription = () => {
        switch (generationStage) {
            case 'preparing':
                return 'Preparing your document...';
            case 'analyzing':
                return 'Analyzing content...';
            case 'generating':
                return `Generating Quizzes...`;
            case 'refining':
                return 'Refining and formatting quizzes...';
            case 'complete':
                return 'Generation completing, just wait for a bit...!';
            default:
                return 'Processing...';
        }
    };

    const handleGenerateQuiz = async () => {
        if (!cardsData) {
            getToast('error', 'No Card data in this Deck');
            return;
        }

        if (!selected) {
            setSelectedError('Please select a difficulty level!');
            return;
        }
        if (cardsData.length < 4) {
            getToast('error', 'At least 4 flashcards are required to generate a quiz.');
            return;
        }
        setIsGenerating(true);
        setGenerationProgress(0);
        setGenerationStage('preparing');
        getToast('loading', 'Generating Quiz...');
        try {
            const flashcards = cardsData.map((card) => ({
                front: card.front,
                back: card.back
            }));
            const quizQuestions = await generateQuizFromFlashcards(
                flashcards,
                numQuestions,
                selected as 'Easy' | 'Medium' | 'Hard'
            );
            createQuizMutation(
                { deckId: deckId!, questions: quizQuestions },
                {
                    onSuccess: (data) => {
                        setGenerationProgress(100);
                        setGenerationStage('complete');
                        getToast('success', `Successfully generated Quiz`);
                        close();
                        navigate(`/do-quiz/${data.id}`);
                    },
                    onError: (error) => {
                        getToast('error', 'Failed to generate quiz');
                        console.error('error creating quiz:', error);
                    }
                }
            );
        } catch (error) {
            console.error('Error generating quiz:', error);
            getToast('error', 'Failed to generate quiz');
        } finally {
            setIsGenerating(false);
            getToast('dismiss');
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent aria-describedby='Generate Quiz' className='w-[700px]'>
                <DialogHeader>
                    <DialogTitle className='font-semibold text-[22px]'>Generate Quiz</DialogTitle>
                </DialogHeader>
                <Card className='border-dashed border-2 bg-muted/40'>
                    <CardContent className='p-6'>
                        {isGenerating ? (
                            <div className='flex flex-col items-center justify-center space-y-6'>
                                <div className='p-4 rounded-full bg-primary/10'>
                                    <Loader2 className='h-10 w-10 text-primary animate-spin' />
                                </div>

                                <div className='text-center'>
                                    <h3 className='text-lg font-medium'>Generating Quiz</h3>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        AI is analyzing your document and creating Quiz
                                    </p>
                                </div>

                                <div className='w-full space-y-2'>
                                    <div className='flex justify-between text-sm'>
                                        <span>{getStageDescription()}</span>
                                        <span>{Math.round(generationProgress)}%</span>
                                    </div>
                                    <Progress value={generationProgress} className='h-2' />
                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center space-y-4'>
                                <div className='p-4 rounded-full bg-primary/10'>
                                    <FileText className='h-10 w-10 text-primary' />
                                </div>
                                <div className='text-center'>
                                    <h3 className='text-lg font-medium'>Generate Quiz with AI</h3>
                                    <DialogDescription className='text-sm text-muted-foreground mt-1'>
                                        Upload a document and let AI create Quiz for you
                                    </DialogDescription>
                                </div>

                                <div className='w-full'>
                                    <div className='mt-4 space-y-3'>
                                        <div>
                                            <Label className='text-sm mb-1 block'>
                                                Number of Questions to generate: {numQuestions}
                                            </Label>
                                            <Slider
                                                value={[numQuestions]}
                                                min={10}
                                                max={50}
                                                step={1}
                                                onValueChange={(values) => setNumQuestions(values[0])}
                                                className='py-4'
                                            />
                                        </div>

                                        <div className='flex gap-2'>
                                            {difficulties.map((difficulty) => {
                                                const isSelected = selected === difficulty.label;
                                                return (
                                                    <Button
                                                        key={difficulty.label}
                                                        variant='outline'
                                                        className={`
                                                            border-${difficulty.color}-400 text-${difficulty.color}-500 
                                                            hover:bg-${difficulty.color}-50 hover:text-${difficulty.color}-600 
                                                            dark:hover:bg-${difficulty.color}-950
                                                            ${isSelected ? `bg-${difficulty.color}-500 text-white border-${difficulty.color}-500 dark:bg-${difficulty.color}-700` : ''}`}
                                                        onClick={() => {
                                                            setSelected(difficulty.label);
                                                            setSelectedError(null);
                                                        }}
                                                    >
                                                        {difficulty.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        {selectedError && <p className='text-red-500 text-sm'>{selectedError}</p>}

                                        <Button
                                            className='w-full'
                                            disabled={isGenerating || isCardsLoading}
                                            onClick={() => handleGenerateQuiz()}
                                        >
                                            <Upload className='h-4 w-4 mr-2' />
                                            Generate Quiz
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};
