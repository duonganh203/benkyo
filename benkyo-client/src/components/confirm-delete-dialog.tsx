import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type ConfirmDeleteDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    className: string;
    description?: string;
};

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, className, description }: ConfirmDeleteDialogProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleConfirm = () => {
        if (description || inputValue === className) {
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
                    {description || 'Are you sure you want to delete this class? This action cannot be undone.'}
                </p>
                {!description && (
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder='Enter class name'
                    />
                )}
                <DialogFooter>
                    <Button variant='outline' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={handleConfirm}
                        disabled={!description && inputValue !== className}
                    >
                        Delete Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;
