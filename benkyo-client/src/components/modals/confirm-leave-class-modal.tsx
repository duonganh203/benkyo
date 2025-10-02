import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmLeaveClassModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting?: boolean;
    classTitle?: string;
};

const ConfirmLeaveClassModal = ({
    open,
    onClose,
    onConfirm,
    isSubmitting,
    classTitle
}: ConfirmLeaveClassModalProps) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Leave Class</DialogTitle>
            </DialogHeader>
            <p className='text-sm text-muted-foreground'>
                Are you sure you want to leave{classTitle ? ` "${classTitle}"` : ''}? You may need an invite to rejoin.
            </p>
            <DialogFooter>
                <Button variant='outline' onClick={onClose} disabled={!!isSubmitting}>
                    Cancel
                </Button>
                <Button variant='destructive' onClick={onConfirm} disabled={!!isSubmitting}>
                    {isSubmitting ? 'Leaving...' : 'Leave'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default ConfirmLeaveClassModal;
