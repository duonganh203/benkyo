import { useSendRequestPublicDeckModal } from '@/hooks/stores/use-send-request-public-deck-modal';
import { getToast } from '@/utils/getToast';
import useSendReqPublicDeck from '@/hooks/queries/use-send-req-public-deck';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPortal,
    DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useQueryClient } from '@tanstack/react-query';

export const RequestPublicDeckModal = () => {
    const queryClient = useQueryClient();
    const { isOpen, close, deckId } = useSendRequestPublicDeckModal((store) => store);
    const { mutateAsync: sendRequestPublicMutation, isPending } = useSendReqPublicDeck(deckId!);
    const handleSendRequest = async () => {
        if (!deckId) return;
        sendRequestPublicMutation(undefined, {
            onSuccess: () => {
                getToast('success', 'Request sent successfully');
                queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
                close();
            },
            onError: (error) => {
                getToast('error', error.message || 'Something went wrong. Please try again!');
            }
        });
    };
    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogPortal>
                <DialogContent className='w-[700px]'>
                    <DialogHeader>
                        <DialogTitle className='font-semibold text-[22px]'>Public Your Deck</DialogTitle>
                        <DialogDescription className='text-sm text-muted-foreground'>
                            Are you sure you want to send a request to the owner of this deck to make it public? This
                            will allow you to access the deck and study it. If the owner accepts your request, you will
                            be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type='button' variant='outline' onClick={close} className='mr-5'>
                            Cancel
                        </Button>
                        <Button type='button' onClick={handleSendRequest} disabled={isPending}>
                            {isPending ? 'Sending...' : 'Send Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
