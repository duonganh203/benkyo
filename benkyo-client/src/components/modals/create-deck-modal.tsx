import { useCreateDeckModal } from '@/hooks/stores/use-create-deck-modal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CreateDeckForm } from '../forms/create-deck-form';

export const CreateDeckModal = () => {
    const { isOpen, close } = useCreateDeckModal((store) => store);
    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className='w-[700px]'>
                <DialogHeader>
                    <DialogTitle className='font-semibold text-[22px]'>Create new deck</DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground'>
                        Ready to start learning? Create a new deck to get started
                    </DialogDescription>
                </DialogHeader>
                <CreateDeckForm />
            </DialogContent>
        </Dialog>
    );
};
