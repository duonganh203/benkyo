import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInviteDialogStore } from '@/hooks/stores/use-invite-dialog-store';

export const InviteDialog = () => {
    const { isOpen, className, description, onAccept, onReject, close } = useInviteDialogStore();

    const handleAccept = () => {
        onAccept();
        close();
    };

    const handleReject = () => {
        onReject();
        close();
    };

    const handleDecideLater = () => {
        close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>You have been invited!</DialogTitle>
                </DialogHeader>
                <div className='space-y-2 text-sm'>
                    <p>
                        <strong>Class:</strong> {className}
                    </p>
                    <p>
                        <strong>Description:</strong> {description}
                    </p>
                </div>
                <DialogFooter className='pt-4 flex flex-col sm:flex-row sm:justify-end sm:space-x-2'>
                    <div className='flex justify-between w-full sm:w-auto gap-2'>
                        <Button variant='ghost' onClick={handleDecideLater} className='flex-1'>
                            Decide Later
                        </Button>
                        <Button variant='outline' onClick={handleReject} className='flex-1'>
                            Reject
                        </Button>
                        <Button onClick={handleAccept} className='flex-1'>
                            Accept
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
