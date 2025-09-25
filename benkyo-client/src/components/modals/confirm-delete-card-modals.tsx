import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteCardModal } from '@/hooks/stores/use-delete-card-modal';

type ConfirmDeleteCardModalProps = {
    onConfirm: (cardId: string) => void;
};

const ConfirmDeleteCardModal = ({ onConfirm }: ConfirmDeleteCardModalProps) => {
    const { isOpen, cardId, close } = useDeleteCardModal();

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Confirm Delete Card</DialogTitle>
                </DialogHeader>
                <p className='text-sm text-muted-foreground'>
                    Do you really want to delete this card? This action is irreversible.
                </p>
                <DialogFooter>
                    <Button variant='outline' onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={() => {
                            if (cardId) onConfirm(cardId); // gọi handleDelete(cardId)
                            close(); // đóng modal
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDeleteCardModal;
