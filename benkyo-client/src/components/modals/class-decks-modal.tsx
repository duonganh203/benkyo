import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClassDeck } from '@/types/class';

type ClassDecksModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    decks: ClassDeck[];
    onRemoveDeck: (deckId: string) => void;
    onDeckClick: (deckId: string) => void;
};

const ClassDecksModal = ({ open, onOpenChange, decks, onRemoveDeck, onDeckClick }: ClassDecksModalProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Class Decks</DialogTitle>
            </DialogHeader>
            <div className='space-y-3 max-h-60 overflow-y-auto'>
                {decks.length > 0 ? (
                    decks.map((deck: ClassDeck) => (
                        <div
                            key={deck.deck._id}
                            className='p-3 border rounded-md flex justify-between items-center gap-4 hover:bg-muted transition'
                        >
                            <div className='flex-1 cursor-pointer' onClick={() => onDeckClick(deck.deck._id)}>
                                <p className='font-medium truncate'>{deck.deck.name}</p>
                                {deck.description && (
                                    <p className='text-sm text-muted-foreground truncate'>{deck.description}</p>
                                )}
                            </div>
                            <Button variant='destructive' size='sm' onClick={() => onRemoveDeck(deck.deck._id)}>
                                Remove
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className='text-sm text-muted-foreground'>No decks found.</p>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

export default ClassDecksModal;
