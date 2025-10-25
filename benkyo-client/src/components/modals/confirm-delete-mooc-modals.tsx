import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDeleteMoocModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const ConfirmDeleteMoocModal = ({ open, onClose, onConfirm, moocTitle }: ConfirmDeleteMoocModalProps) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md' aria-describedby='delete-mooc-description'>
            <DialogHeader>
                <DialogTitle>Confirm Remove MOOC</DialogTitle>
            </DialogHeader>
            <p id='delete-mooc-description' className='text-sm text-muted-foreground'>
                Are you sure you want to delete this MOOC? This action cannot be undone.
            </p>
            <DialogFooter>
                <Button variant='outline' onClick={onClose}>
                    Cancel
                </Button>
                <Button variant='destructive' onClick={onConfirm}>
                    Delete
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default ConfirmDeleteMoocModal;
