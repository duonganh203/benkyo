import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Plus, XCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import useGetDeckById from '@/hooks/queries/use-get-deck-id';
import { CardSchema } from '@/schemas/cardSchema';
import { getToast } from '@/utils/getToast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import useGetCardId from '@/hooks/queries/use-get-card-id';
import useUpdateCard from '@/hooks/queries/use-update-card';

const UpdateCard = () => {
    const { deckId, cardId } = useParams<{ deckId: string; cardId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data } = useGetCardId(cardId!);

    const [tagInput, setTagInput] = useState<string>('');

    const { data: deckData } = useGetDeckById(deckId!);

    const form = useForm<z.infer<typeof CardSchema>>({
        resolver: zodResolver(CardSchema),
        defaultValues: {
            front: data?.front || '',
            back: data?.back || '',
            tags: data?.tags || []
        }
    });
    useEffect(() => {
        if (data) {
            form.reset({
                front: data.front,
                back: data.back,
                tags: data.tags
            });
        }
    }, [data]);

    const { mutateAsync: updateCardMutation, isPending: isUpdatingCard } = useUpdateCard();

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
        updateCardMutation(
            {
                cardId: cardId || '',
                data: {
                    ...data,
                    deckId: deckId || ''
                }
            },
            {
                onSuccess: () => {
                    getToast('success', 'Card updated successfully');
                    queryClient.invalidateQueries({ queryKey: ['deckCards', deckId] });
                    form.reset({ front: '', back: '', tags: [] });
                },
                onError: (error) => {
                    getToast('error', error.message || 'Failed to create card');
                    console.error(error);
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
                        <h1 className='text-2xl font-bold'>Update Card</h1>
                        <p className='text-muted-foreground'>Deck: {deckData?.name || 'Loading...'}</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue='manual' className='w-full'>
                <TabsList className='grid w-full grid-cols-1 mb-6'>
                    <TabsTrigger value='manual'>Manual Entry</TabsTrigger>
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
                                            disabled={isUpdatingCard}
                                        >
                                            Clear
                                        </Button>
                                        <Button type='submit' disabled={isUpdatingCard}>
                                            <Save className='h-4 w-4 mr-2' />
                                            Save Card
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UpdateCard;
