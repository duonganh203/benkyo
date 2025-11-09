import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { UpdateDeckForm } from '../forms/update-deck-form';
import { useUpdateDeckModal } from '@/hooks/stores/use-update-deck-modal';

export const UpdateDeckModal = () => {
    const { isOpen, close, deck } = useUpdateDeckModal();

    if (!isOpen || !deck) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent className='w-[700px]'>
                <DialogHeader>
                    <DialogTitle className='font-semibold text-[22px]'>Update Deck</DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground'>
                        Modify your deck information here
                    </DialogDescription>
                </DialogHeader>
                <UpdateDeckForm deck={deck} close={close} />
            </DialogContent>
        </Dialog>
    );
};
