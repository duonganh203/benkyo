import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmDeleteUserModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const ConfirmDeleteUserModal = ({ open, onClose, onConfirm }: ConfirmDeleteUserModalProps) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className='text-sm text-muted-foreground'>
                Are you sure you want to delete this item? This action cannot be undone.
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

export default ConfirmDeleteUserModal;
