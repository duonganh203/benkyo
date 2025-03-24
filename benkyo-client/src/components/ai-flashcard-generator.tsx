import { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Loader2, X, Check, Plus, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { generateFlashcardsFromFile } from '@/utils/getAIFlashcard';
import { BatchImportCard } from '@/types/card';
import { useQueryClient } from '@tanstack/react-query';
import useBatchCreateCards from '@/hooks/queries/use-batch-create-cards';
import { getToast } from '@/utils/getToast';
import { CardSchema } from '@/schemas/cardSchema';
import AICardEditor from './ai-card-editor';
import MemoryGame from '@/components/memory-game/MemoryGame';

type CardValidation = {
    front: string | null;
    back: string | null;
};

type GenerationStage = 'preparing' | 'analyzing' | 'generating' | 'refining' | 'complete';

const AIFlashcardGenerator = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const queryClient = useQueryClient();

    const [file, setFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [numCards, setNumCards] = useState<number>(10);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [generatedCards, setGeneratedCards] = useState<BatchImportCard[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [cardValidation, setCardValidation] = useState<Record<number, CardValidation>>({});
    const [formErrors, setFormErrors] = useState<string | null>(null);

    const [generationStage, setGenerationStage] = useState<GenerationStage>('preparing');
    const [generationProgress, setGenerationProgress] = useState<number>(0);

    const allowedFileTypes = ['application/pdf', 'application/msword', 'text/plain'];

    const { mutateAsync: batchCreateCardsMutation } = useBatchCreateCards();

    useEffect(() => {
        const newValidation: Record<number, CardValidation> = {};
        generatedCards.forEach((card, index) => {
            const result = CardSchema.safeParse(card);
            if (!result.success) {
                const errors = result.error.format();
                newValidation[index] = {
                    front: errors.front?._errors[0] || null,
                    back: errors.back?._errors[0] || null
                };
            } else {
                newValidation[index] = {
                    front: null,
                    back: null
                };
            }
        });
        setCardValidation(newValidation);
    }, [generatedCards]);

    useEffect(() => {
        if (!isGenerating) return;

        const stages: GenerationStage[] = ['preparing', 'analyzing', 'generating', 'refining', 'complete'];
        const stageDurations = [4000, 10000, 8000, 8000, 1000];
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];

            if (!allowedFileTypes.includes(selectedFile.type)) {
                toast.error('Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.');
                return;
            }

            if (selectedFile.size > 15 * 1024 * 1024) {
                toast.error('File is too large. Maximum size is 15MB.');
                return;
            }

            setFile(selectedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const generateFlashcards = async () => {
        if (!file) {
            toast.error('Please upload a document first');
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setGenerationStage('preparing');
        toast.loading('Generating flashcards from your document...');

        setTimeout(() => {
            const memoryGameElement = document.getElementById('memory-game');
            if (memoryGameElement) {
                memoryGameElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const firstInteractiveElement = memoryGameElement.querySelector('button');
                if (firstInteractiveElement) {
                    firstInteractiveElement.focus();
                }
            }
        }, 100);

        try {
            const flashcards = await generateFlashcardsFromFile(file, numCards);

            const formattedCards = flashcards.map((card) => ({
                front: card.front,
                back: card.back,
                tags: ['AI-generated']
            }));

            // Set progress to 100% when complete
            setGenerationProgress(100);
            setGenerationStage('complete');

            toast.success(`Successfully generated ${formattedCards.length} flashcards`);
            setGeneratedCards(formattedCards);
            setShowPreviewDialog(true);
        } catch (error) {
            toast.error('Failed to generate flashcards. Please try again.');
            console.error('Error generating flashcards:', error);
        } finally {
            setIsGenerating(false);
            toast.dismiss();
        }
    };

    const handleChange = (index: number, field: 'front' | 'back', value: string) => {
        const updatedCards = [...generatedCards];
        updatedCards[index] = {
            ...updatedCards[index],
            [field]: value
        };
        setGeneratedCards(updatedCards);
    };

    const handleTagChange = (index: number, tagsString: string) => {
        const updatedCards = [...generatedCards];
        updatedCards[index] = {
            ...updatedCards[index],
            tags: tagsString
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
        };
        setGeneratedCards(updatedCards);
    };

    const removeCard = (index: number) => {
        const newCards = [...generatedCards];
        newCards.splice(index, 1);
        setGeneratedCards(newCards);

        const newValidation = { ...cardValidation };
        delete newValidation[index];

        Object.keys(newValidation).forEach((key) => {
            const keyNum = parseInt(key);
            if (keyNum > index) {
                newValidation[keyNum - 1] = newValidation[keyNum];
                delete newValidation[keyNum];
            }
        });

        setCardValidation(newValidation);
    };

    const addCard = () => {
        setGeneratedCards([
            ...generatedCards,
            {
                front: '',
                back: '',
                tags: ['AI-generated']
            }
        ]);
    };

    const validateForm = () => {
        if (generatedCards.length === 0) {
            setFormErrors('Please add at least one card');
            return false;
        }

        const hasErrors = Object.values(cardValidation).some(
            (validation) => validation.front !== null || validation.back !== null
        );

        if (hasErrors) {
            setFormErrors('Please correct all validation errors before submitting');
            return false;
        }

        const hasEmptyCards = generatedCards.some((card) => !card.front.trim() || !card.back.trim());

        if (hasEmptyCards) {
            setFormErrors('All cards must have both question and answer content');
            return false;
        }

        setFormErrors(null);
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            handleImportSelected();
        }
    };

    const handleImportSelected = async () => {
        if (!validateForm()) {
            return;
        }

        const validCards = generatedCards.filter((card) => card.front.trim() && card.back.trim());

        if (validCards.length === 0) {
            toast.error('Please provide content for at least one card');
            return;
        }

        setIsImporting(true);

        try {
            await batchCreateCardsMutation(
                {
                    cards: validCards,
                    deckId: deckId || ''
                },
                {
                    onSuccess: (data) => {
                        getToast('success', `Successfully created ${data.cardsCreated} flashcards`);
                        queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });

                        setShowPreviewDialog(false);
                        setGeneratedCards([]);
                        clearFile();
                    },
                    onError: (error) => {
                        getToast('error', error.message || 'Failed to import cards');
                    }
                }
            );
        } catch (error) {
            console.error('Error importing cards:', error);
        } finally {
            setIsImporting(false);
        }
    };

    const getStageDescription = () => {
        switch (generationStage) {
            case 'preparing':
                return 'Preparing your document...';
            case 'analyzing':
                return 'Analyzing content...';
            case 'generating':
                return `Generating ${numCards} flashcards...`;
            case 'refining':
                return 'Refining and formatting cards...';
            case 'complete':
                return 'Generation completing, just wait for a bit...!';
            default:
                return 'Processing...';
        }
    };

    return (
        <>
            <Card className='border-dashed border-2 bg-muted/40'>
                <CardContent className='p-6'>
                    {isGenerating ? (
                        <div className='flex flex-col items-center justify-center space-y-6'>
                            <div className='p-4 rounded-full bg-primary/10'>
                                <Loader2 className='h-10 w-10 text-primary animate-spin' />
                            </div>

                            <div className='text-center'>
                                <h3 className='text-lg font-medium'>Generating Flashcards</h3>
                                <p className='text-sm text-muted-foreground mt-1'>
                                    AI is analyzing your document and creating flashcards
                                </p>
                            </div>

                            <div className='w-full space-y-2'>
                                <div className='flex justify-between text-sm'>
                                    <span>{getStageDescription()}</span>
                                    <span>{Math.round(generationProgress)}%</span>
                                </div>
                                <Progress value={generationProgress} className='h-2' />
                            </div>

                            <p className='text-xs text-muted-foreground'>Enjoy a memory game below while you wait!</p>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center space-y-4'>
                            <div className='p-4 rounded-full bg-primary/10'>
                                <FileText className='h-10 w-10 text-primary' />
                            </div>
                            <div className='text-center'>
                                <h3 className='text-lg font-medium'>Generate Flashcards with AI</h3>
                                <p className='text-sm text-muted-foreground mt-1'>
                                    Upload a document and let AI create flashcards for you
                                </p>
                            </div>

                            {!file ? (
                                <div className='w-full'>
                                    <Label htmlFor='ai-document-upload' className='sr-only'>
                                        Upload document
                                    </Label>
                                    <Input
                                        id='ai-document-upload'
                                        ref={fileInputRef}
                                        type='file'
                                        accept='.pdf,.doc,.docx,.txt'
                                        onChange={handleFileChange}
                                        className='cursor-pointer'
                                    />
                                    <p className='text-xs text-muted-foreground mt-2 text-center'>
                                        Supported formats: PDF, DOC, DOCX, TXT (max 15MB)
                                    </p>
                                </div>
                            ) : (
                                <div className='w-full'>
                                    <div className='flex items-center justify-between p-2 border rounded-md'>
                                        <div className='flex items-center'>
                                            <FileText className='h-5 w-5 mr-2 flex-shrink-0' />
                                            <span className='text-sm truncate max-w-[200px]'>{file.name}</span>
                                        </div>
                                        <Button size='icon' variant='ghost' className='h-8 w-8' onClick={clearFile}>
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </div>

                                    <div className='mt-4 space-y-3'>
                                        <div>
                                            <Label className='text-sm mb-1 block'>
                                                Number of flashcards to generate: {numCards}
                                            </Label>
                                            <Slider
                                                value={[numCards]}
                                                min={5}
                                                max={30}
                                                step={1}
                                                onValueChange={(values) => setNumCards(values[0])}
                                                className='py-4'
                                            />
                                        </div>

                                        <Button className='w-full' onClick={generateFlashcards} disabled={isGenerating}>
                                            <Upload className='h-4 w-4 mr-2' />
                                            Generate Flashcards
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isGenerating && <MemoryGame />}

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Review & Edit Generated Flashcards</DialogTitle>
                    </DialogHeader>

                    <div className='text-sm text-muted-foreground mb-4'>
                        Review and edit the AI-generated flashcards before adding them to your deck.
                    </div>

                    {formErrors && (
                        <div className='bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2 mb-4'>
                            <AlertCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                            <div>{formErrors}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='space-y-4'>
                            {generatedCards.map((card, index) => (
                                <AICardEditor
                                    key={index}
                                    card={card}
                                    index={index}
                                    validation={cardValidation[index]}
                                    onChange={handleChange}
                                    onTagChange={handleTagChange}
                                    onRemove={removeCard}
                                />
                            ))}
                        </div>

                        <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                            <Button type='button' variant='outline' onClick={addCard} className='w-full sm:w-auto'>
                                <Plus className='mr-1.5 h-4 w-4' />
                                Add Card
                            </Button>

                            <Button type='submit' className='w-full sm:w-auto sm:ml-auto' disabled={isImporting}>
                                {isImporting ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Check className='h-4 w-4 mr-2' />
                                        Save Collection
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AIFlashcardGenerator;
