import { z } from 'zod';
import { useForm } from 'react-hook-form';
import useUpdateDeck from '@/hooks/queries/use-update-deck';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getToast } from '@/utils/getToast';
import { DeckInterface } from '@/types/deck';
import { zodResolver } from '@hookform/resolvers/zod';

const UpdateDeckSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional()
});

type Props = {
    deck: DeckInterface;
    close: () => void;
};

export function UpdateDeckForm({ deck, close }: Props) {
    const { mutateAsync: updateDeck, isPending } = useUpdateDeck();

    const form = useForm<z.infer<typeof UpdateDeckSchema>>({
        defaultValues: { name: deck.name, description: deck.description || '' },
        resolver: zodResolver(UpdateDeckSchema)
    });

    const onSubmit = async (data: z.infer<typeof UpdateDeckSchema>) => {
        try {
            await updateDeck({ deckId: deck._id, payload: data });
            getToast('success', 'Deck updated successfully!');
            close();
        } catch (error: any) {
            getToast('error', error.message || 'Something went wrong!');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter deck name' required {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder='Describe your deck' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className='flex justify-end gap-4 mt-4'>
                    <Button type='button' variant='outline' onClick={close} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isPending}>
                        Update Deck
                    </Button>
                </div>
            </form>
        </Form>
    );
}
