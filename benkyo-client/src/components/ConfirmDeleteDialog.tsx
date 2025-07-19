import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type ConfirmDeleteDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    className: string;
};

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, className }: ConfirmDeleteDialogProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleConfirm = () => {
        if (inputValue === className) {
            onConfirm();
            setInputValue('');
        }
    };

    const handleClose = () => {
        setInputValue('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p className='text-sm text-muted-foreground'>
                    To confirm deletion, please type <span className='font-semibold'>"{className}"</span> below.
                </p>
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder='Enter class name'
                />
                <DialogFooter>
                    <Button variant='outline' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='destructive' onClick={handleConfirm} disabled={inputValue !== className}>
                        Delete Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;
