import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CreateDeckSchema } from '@/schemas/deckSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateDeckModal } from '@/hooks/stores/use-create-deck-modal';
import useCreateDeck from '@/hooks/queries/use-create-deck';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getToast } from '@/utils/getToast';

export function CreateDeckForm() {
    const { close } = useCreateDeckModal((store) => store);
    const { mutateAsync: createDeck, isPending } = useCreateDeck();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof CreateDeckSchema>>({
        resolver: zodResolver(CreateDeckSchema),
        defaultValues: {
            name: '',
            description: ''
        }
    });
    const onSubmit = (data: z.infer<typeof CreateDeckSchema>) => {
        createDeck(data, {
            onSuccess: (res) => {
                getToast('success', 'Deck created successfully!!!');
                close();
                navigate(`/deck/${res.id}`);
            },
            onError: (error) => {
                getToast('error', error.message || 'Something went wrong!!!');
            }
        });
    };
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <div className='grid gap-2'>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input id='name' type='name' placeholder='John Smith' required {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage className='mt-0' />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <div className='grid gap-2'>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                id='description'
                                                type='description'
                                                placeholder='Describe your deck'
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className='mt-0' />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='flex items-center justify-end mt-4 space-x-4'>
                        <Button type='button' variant='outline' onClick={close} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type='submit' variant='default' disabled={isPending}>
                            Create Deck
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
