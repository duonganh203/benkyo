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
        <DialogContent className='sm:max-w-lg'>
            <DialogHeader className='space-y-3'>
                <DialogTitle className='flex items-center gap-3 text-xl font-semibold'>
                    <div className='flex items-center justify-center w-8 h-8 bg-primary rounded-lg'>
                        <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z' />
                        </svg>
                    </div>
                    Class Decks
                </DialogTitle>
                <p className='text-sm text-muted-foreground'>Manage flashcard decks in your class</p>
            </DialogHeader>
            <div className='space-y-3 max-h-80 overflow-y-auto'>
                {decks.length > 0 ? (
                    decks.map((deck: ClassDeck) => (
                        <div
                            key={deck.deck._id}
                            className='group p-4 border border-border rounded-lg hover:bg-accent/50 transition-all duration-200 hover:shadow-md'
                        >
                            <div className='flex justify-between items-start gap-4'>
                                <div className='flex-1 cursor-pointer' onClick={() => onDeckClick(deck.deck._id)}>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-2 h-2 bg-primary rounded-full'></div>
                                        <h3 className='font-semibold text-lg group-hover:text-primary transition-colors truncate'>
                                            {deck.deck.name}
                                        </h3>
                                    </div>
                                    {deck.description && (
                                        <p className='text-sm text-muted-foreground mb-3 truncate'>
                                            {deck.description}
                                        </p>
                                    )}
                                    {(deck.startTime || deck.endTime) && (
                                        <div className='mt-3 p-3 bg-muted/50 border border-border rounded-md'>
                                            <div className='flex items-center gap-2 text-sm font-medium text-foreground mb-2'>
                                                <svg
                                                    className='w-4 h-4 text-muted-foreground'
                                                    fill='currentColor'
                                                    viewBox='0 0 20 20'
                                                >
                                                    <path
                                                        fillRule='evenodd'
                                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                                                        clipRule='evenodd'
                                                    />
                                                </svg>
                                                <span>Schedule</span>
                                            </div>
                                            <div className='text-sm space-y-2'>
                                                {deck.startTime && (
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-green-700'>Start:</span>
                                                        <span className='text-green-800 bg-green-100 px-2 py-1 rounded text-xs'>
                                                            {new Date(deck.startTime).toLocaleDateString('en-US', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                {deck.endTime && (
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-red-700'>End:</span>
                                                        <span className='text-red-800 bg-red-100 px-2 py-1 rounded text-xs'>
                                                            {new Date(deck.endTime).toLocaleDateString('en-US', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button variant='destructive' size='sm' onClick={() => onRemoveDeck(deck.deck._id)}>
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='text-center py-12'>
                        <div className='flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4'>
                            <svg className='w-8 h-8 text-muted-foreground' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z' />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-foreground mb-2'>No decks found</h3>
                        <p className='text-sm text-muted-foreground'>Add your first deck to get started!</p>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

export default ClassDecksModal;
