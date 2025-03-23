import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Save, Plus, XCircle, Upload, FileText, Check, UploadCloud, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import useGetDeckById from '@/hooks/queries/use-get-deck-id';
import useCreateCard from '@/hooks/queries/use-create-card';
import useBatchCreateCards from '@/hooks/queries/use-batch-create-cards';
import { BatchImportCard } from '@/types/card';
import { CardSchema } from '@/schemas/cardSchema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';

interface ImportStats {
    total: number;
    valid: number;
    invalid: number;
    processed: number;
}

const CreateCard = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [tagInput, setTagInput] = useState<string>('');
    const [importMode, setImportMode] = useState<boolean>(false);
    const [importContent, setImportContent] = useState<string>('');
    const [delimiter, setDelimiter] = useState<string>(';'); // Default to semicolon delimiter
    const [importCards, setImportCards] = useState<BatchImportCard[]>([]);
    const [previewCards, setPreviewCards] = useState<BatchImportCard[]>([]);
    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [importStats, setImportStats] = useState<ImportStats>({
        total: 0,
        valid: 0,
        invalid: 0,
        processed: 0
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data: deckData } = useGetDeckById(deckId!);

    const form = useForm<z.infer<typeof CardSchema>>({
        resolver: zodResolver(CardSchema),
        defaultValues: {
            front: '',
            back: '',
            tags: []
        }
    });

    const { mutateAsync: createCardMutation, isPending: isCreatingCard } = useCreateCard();
    const { mutateAsync: batchCreateCardsMutation, isPending: isBatchCreating } = useBatchCreateCards();

    const resetImportForm = () => {
        setImportContent('');
        setImportCards([]);
        setPreviewCards([]);
        setImportStats({
            total: 0,
            valid: 0,
            invalid: 0,
            processed: 0
        });
        setIsSubmitting(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !form.getValues().tags.includes(tagInput.trim())) {
            const currentTags = form.getValues().tags;
            form.setValue('tags', [...currentTags, tagInput.trim()], { shouldValidate: true });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        const currentTags = form.getValues().tags;
        form.setValue(
            'tags',
            currentTags.filter((t) => t !== tag),
            { shouldValidate: true }
        );
    };

    const onSubmit = (data: z.infer<typeof CardSchema>) => {
        createCardMutation(
            {
                ...data,
                deckId: deckId || ''
            },
            {
                onSuccess: () => {
                    toast.success('Card created successfully');
                    queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
                    form.reset({ front: '', back: '', tags: [] });
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to create card');
                    console.error(error);
                }
            }
        );
    };

    const parseImportContent = () => {
        const lines = importContent.trim().split('\n');
        const cards: BatchImportCard[] = [];
        let validCards = 0;
        let invalidCards = 0;

        lines.forEach((line) => {
            const parts = line.split(delimiter);
            if (parts.length >= 2) {
                const [front, back, ...tagParts] = parts;
                const tags =
                    tagParts.length > 0
                        ? tagParts[0]
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : [];

                if (front.trim() && back.trim()) {
                    cards.push({
                        front: front.trim(),
                        back: back.trim(),
                        tags
                    });
                    validCards++;
                } else {
                    invalidCards++;
                }
            } else {
                invalidCards++;
            }
        });

        setImportCards(cards);
        setPreviewCards(cards.slice(0, 5));
        setImportStats({
            total: lines.length,
            valid: validCards,
            invalid: invalidCards,
            processed: 0
        });
    };

    const handleBatchImport = async () => {
        if (importCards.length === 0) {
            toast.error('No valid cards to import');
            return;
        }

        setIsSubmitting(true);
        batchCreateCardsMutation(
            {
                cards: importCards,
                deckId: deckId || ''
            },
            {
                onSuccess: (data) => {
                    toast.success(`Successfully created ${data.cardsCreated} cards`);
                    queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
                    resetImportForm();
                    setImportDialogOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to import cards');
                    console.error(error);
                    setIsSubmitting(false);
                }
            }
        );
    };

    return (
        <div className='max-w-3xl h-full flex flex-col justify-center mx-auto py-8 px-4'>
            <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => navigate(`/deck/${deckId}`)}>
                        <ChevronLeft className='h-5 w-5' />
                    </Button>
                    <div>
                        <h1 className='text-2xl font-bold'>Add Cards</h1>
                        <p className='text-muted-foreground'>Deck: {deckData?.name || 'Loading...'}</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue='manual' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 mb-6'>
                    <TabsTrigger value='manual' onClick={() => setImportMode(false)}>
                        Manual Entry
                    </TabsTrigger>
                    <TabsTrigger value='import' onClick={() => setImportMode(true)}>
                        Batch Import
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='manual' className='space-y-4'>
                    <Card className='border-none shadow-none'>
                        <CardContent className='p-0 space-y-6'>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                                    <FormField
                                        control={form.control}
                                        name='front'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>Question (Front)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder='Enter the question or prompt'
                                                        className='min-h-[120px] resize-none'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='back'
                                        render={({ field }) => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>Answer (Back)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder='Enter the answer or explanation'
                                                        className='min-h-[120px] resize-none'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='tags'
                                        render={() => (
                                            <FormItem className='space-y-2'>
                                                <FormLabel>Tags</FormLabel>
                                                <div className='flex'>
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        placeholder='Add tags to organize your cards'
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddTag();
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type='button'
                                                        onClick={handleAddTag}
                                                        variant='outline'
                                                        className='ml-2'
                                                    >
                                                        <Plus className='h-4 w-4' />
                                                    </Button>
                                                </div>

                                                {form.getValues().tags.length > 0 && (
                                                    <div className='flex flex-wrap gap-1.5 mt-2'>
                                                        {form.getValues().tags.map((tag) => (
                                                            <Badge key={tag} variant='secondary' className='px-2 py-0'>
                                                                {tag}
                                                                <button
                                                                    type='button'
                                                                    onClick={() => handleRemoveTag(tag)}
                                                                    className='ml-1 hover:text-destructive'
                                                                >
                                                                    <XCircle className='h-3 w-3' />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className='flex items-center justify-between pt-4'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => form.reset({ front: '', back: '', tags: [] })}
                                            disabled={isCreatingCard}
                                        >
                                            Clear
                                        </Button>
                                        <Button type='submit' disabled={isCreatingCard}>
                                            <Save className='h-4 w-4 mr-2' />
                                            Save Card
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='import' className='space-y-4'>
                    <Card className='border-none shadow-none'>
                        <CardContent className='p-0'>
                            <div className='space-y-6'>
                                <div className='bg-muted/40 rounded-md p-4 border border-dashed'>
                                    <div className='text-center py-6'>
                                        <UploadCloud className='h-10 w-10 mx-auto text-muted-foreground mb-4' />
                                        <h3 className='text-lg font-medium mb-2'>Batch Import Cards</h3>
                                        <p className='text-muted-foreground text-sm max-w-md mx-auto mb-4'>
                                            Each line should contain front and back content separated by a delimiter.
                                            Optionally include tags as a third element.
                                        </p>

                                        <div className='flex items-center justify-center gap-2 mb-4'>
                                            <Label htmlFor='delimiter' className='text-sm'>
                                                Delimiter:
                                            </Label>
                                            <select
                                                id='delimiter'
                                                className='h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'
                                                value={delimiter}
                                                onChange={(e) => setDelimiter(e.target.value)}
                                            >
                                                <option value=';'>Semicolon</option>
                                                <option value=','>Comma</option>
                                                <option value='|'>Pipe</option>
                                            </select>
                                        </div>

                                        <Textarea
                                            placeholder={`Question${delimiter}Answer${delimiter}tag1,tag2,tag3`}
                                            className='h-48 mb-4 font-mono'
                                            value={importContent}
                                            onChange={(e) => setImportContent(e.target.value)}
                                        />

                                        <Button onClick={parseImportContent} disabled={!importContent.trim()}>
                                            <FileText className='h-4 w-4 mr-2' />
                                            Parse Content
                                        </Button>
                                    </div>
                                </div>

                                {importStats.total > 0 && (
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-3 gap-4 text-center'>
                                            <div className='p-3 rounded-md bg-muted'>
                                                <div className='text-2xl font-bold'>{importStats.total}</div>
                                                <div className='text-xs text-muted-foreground'>Total Lines</div>
                                            </div>
                                            <div className='p-3 rounded-md bg-muted'>
                                                <div className='text-2xl font-bold text-primary'>
                                                    {importStats.valid}
                                                </div>
                                                <div className='text-xs text-muted-foreground'>Valid Cards</div>
                                            </div>
                                            <div className='p-3 rounded-md bg-muted'>
                                                <div className='text-2xl font-bold text-destructive'>
                                                    {importStats.invalid}
                                                </div>
                                                <div className='text-xs text-muted-foreground'>Invalid Lines</div>
                                            </div>
                                        </div>

                                        {previewCards.length > 0 && (
                                            <div>
                                                <h3 className='text-sm font-medium mb-2'>
                                                    Preview ({Math.min(previewCards.length, 5)} of {importCards.length}
                                                    ):
                                                </h3>
                                                <div className='space-y-2'>
                                                    {previewCards.map((card, index) => (
                                                        <div key={index} className='p-3 rounded-md border text-sm'>
                                                            <div className='grid grid-cols-2 gap-4'>
                                                                <div>
                                                                    <div className='text-xs text-muted-foreground mb-1'>
                                                                        Question:
                                                                    </div>
                                                                    <div className='font-medium'>{card.front}</div>
                                                                </div>
                                                                <div>
                                                                    <div className='text-xs text-muted-foreground mb-1'>
                                                                        Answer:
                                                                    </div>
                                                                    <div>{card.back}</div>
                                                                </div>
                                                            </div>
                                                            {card.tags.length > 0 && (
                                                                <div className='mt-2'>
                                                                    <div className='text-xs text-muted-foreground mb-1'>
                                                                        Tags:
                                                                    </div>
                                                                    <div className='flex flex-wrap gap-1'>
                                                                        {card.tags.map((tag, i) => (
                                                                            <Badge
                                                                                key={i}
                                                                                variant='outline'
                                                                                className='text-xs'
                                                                            >
                                                                                {tag}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className='flex justify-end gap-2 pt-4'>
                                            <Button variant='outline' onClick={resetImportForm}>
                                                <Trash2 className='h-4 w-4 mr-2' />
                                                Clear
                                            </Button>
                                            <Button
                                                onClick={() => setImportDialogOpen(true)}
                                                disabled={importCards.length === 0}
                                            >
                                                <Upload className='h-4 w-4 mr-2' />
                                                Import {importCards.length} Cards
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import {importCards.length} Cards</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to import {importCards.length} cards into deck "{deckData?.name || ''}
                            "?
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex justify-end gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => setImportDialogOpen(false)}
                            disabled={isBatchCreating || isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleBatchImport} disabled={isBatchCreating || isSubmitting}>
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Check className='h-4 w-4 mr-2' />
                                    Confirm Import
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CreateCard;
