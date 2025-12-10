import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DeckInterface } from '@/types/deck';

interface ReviewRequestNoteModalProps {
    open: boolean;
    onClose: (open: boolean) => void;
    deck: DeckInterface | null;
}

const statusMap: Record<1 | 2 | 3, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    2: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    3: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
};

export default function ReviewRequestNoteModal({ open, onClose, deck }: ReviewRequestNoteModalProps) {
    if (!deck) return null;

    const statusKey = deck.publicStatus as 1 | 2 | 3;
    const status = statusMap[statusKey];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle>Review Details</DialogTitle>
                </DialogHeader>

                <div className='space-y-4 mt-2'>
                    <div className='flex items-center justify-between'>
                        <span className='font-medium'>Deck name</span>
                        <span>{deck.name}</span>
                    </div>

                    <div className='flex items-center justify-between'>
                        <span className='font-medium'>Status</span>
                        {status ? (
                            <Badge className={status.color}>{status.label}</Badge>
                        ) : (
                            <Badge className='bg-gray-200 text-gray-600'>Unknown</Badge>
                        )}
                    </div>

                    <div>
                        <p className='font-medium mb-1'>Admin’s Note</p>
                        <ScrollArea className='h-32 rounded border p-2 text-sm text-muted-foreground'>
                            {deck.reviewNote || 'No note provided.'}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
