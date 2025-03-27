import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImportConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    cardCount: number;
    deckName: string;
}

const ImportConfirmDialog = ({
    isOpen,
    onOpenChange,
    onConfirm,
    isSubmitting,
    cardCount,
    deckName
}: ImportConfirmDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='animate-scale-in'>
                <DialogHeader>
                    <DialogTitle>Import {cardCount} Cards</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to import {cardCount} cards into deck "{deckName}"?
                    </DialogDescription>
                </DialogHeader>
                <div className='flex justify-end gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className='hover:bg-destructive/10 transition-colors'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className='hover:scale-105 active:scale-95 transition-all'
                    >
                        {isSubmitting ? (
                            <span className='animate-pulse-subtle'>Processing...</span>
                        ) : (
                            <>
                                <Check className='h-4 w-4 mr-2' />
                                Confirm Import
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImportConfirmDialog;
