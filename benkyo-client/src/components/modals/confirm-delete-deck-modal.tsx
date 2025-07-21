import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDeleteDeckModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const ConfirmDeleteDeckModal = ({ open, onClose, onConfirm }: ConfirmDeleteDeckModalProps) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Confirm Remove Deck</DialogTitle>
            </DialogHeader>
            <p className='text-sm text-muted-foreground'>
                Are you sure you want to remove this deck from the class? This action cannot be undone.
            </p>
            <DialogFooter>
                <Button variant='outline' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant='destructive' onClick={onConfirm}>
                    Remove
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default ConfirmDeleteDeckModal;
