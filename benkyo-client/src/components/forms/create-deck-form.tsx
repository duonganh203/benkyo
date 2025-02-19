import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { CreateDeckSchema } from '@/schemas/deck';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useCreateDeckModal } from '@/hooks/stores/use-create-deck-modal';

export function CreateDeckForm() {
    const { close } = useCreateDeckModal((store) => store);
    const form = useForm<z.infer<typeof CreateDeckSchema>>({
        resolver: zodResolver(CreateDeckSchema),
        defaultValues: {
            name: '',
            description: ''
        }
    });
    const onSubmit = (data: z.infer<typeof CreateDeckSchema>) => {};
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
                        <Button type='button' variant='outline' onClick={close}>
                            Cancel
                        </Button>
                        <Button type='submit' variant='default'>
                            Create Deck
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
