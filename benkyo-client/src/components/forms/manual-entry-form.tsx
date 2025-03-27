import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Plus, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getToast } from '@/utils/getToast';
import useCreateCard from '@/hooks/queries/use-create-card';
import { CardSchema } from '@/schemas/cardSchema';

interface ManualEntryFormProps {
    deckId: string;
}

const ManualEntryForm = ({ deckId }: ManualEntryFormProps) => {
    const [tagInput, setTagInput] = useState<string>('');
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof CardSchema>>({
        resolver: zodResolver(CardSchema),
        defaultValues: {
            front: '',
            back: '',
            tags: []
        }
    });

    const { mutateAsync: createCardMutation, isPending: isCreatingCard } = useCreateCard();

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
                    getToast('success', 'Card created successfully');
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
        <Card className='border-none shadow-none transition-all bg-transparent'>
            <CardContent className='p-0 space-y-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='front'
                            render={({ field }) => (
                                <FormItem className='space-y-2 animate-slide-up animation-delay-300'>
                                    <FormLabel>Question (Front)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Enter the question or prompt'
                                            className='min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-ring/30'
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
                                <FormItem className='space-y-2 animate-slide-up animation-delay-400'>
                                    <FormLabel>Answer (Back)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Enter the answer or explanation'
                                            className='min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-ring/30'
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
                                <FormItem className='space-y-2 animate-slide-up animation-delay-500'>
                                    <FormLabel>Tags</FormLabel>
                                    <div className='flex'>
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            placeholder='Add tags to organize your cards'
                                            className='transition-all focus:ring-2 focus:ring-ring/30'
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
                                            className='ml-2 transition-all'
                                        >
                                            <Plus className='h-4 w-4' />
                                        </Button>
                                    </div>

                                    {form.getValues().tags.length > 0 && (
                                        <div className='flex flex-wrap gap-1.5 mt-2'>
                                            {form.getValues().tags.map((tag, idx) => (
                                                <Badge
                                                    key={tag}
                                                    variant='secondary'
                                                    className='px-2 py-0 animate-scale-in'
                                                    style={{ animationDelay: `${idx * 50}ms` }}
                                                >
                                                    {tag}
                                                    <button
                                                        type='button'
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className='ml-1 hover:text-destructive transition-colors'
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

                        <div className='flex items-center justify-between pt-4 animate-slide-up animation-delay-600'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => form.reset({ front: '', back: '', tags: [] })}
                                disabled={isCreatingCard}
                                className='hover:bg-destructive/10 hover:text-destructive transition-all'
                            >
                                Clear
                            </Button>
                            <Button type='submit' disabled={isCreatingCard} className='transition-all'>
                                <Save className={`h-4 w-4 mr-2 ${isCreatingCard ? 'animate-pulse-subtle' : ''}`} />
                                {isCreatingCard ? 'Saving...' : 'Save Card'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ManualEntryForm;
