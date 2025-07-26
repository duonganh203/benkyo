import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { ClassStudySession } from '@/types/class';

interface ClassResumeSessionModalProps {
    open: boolean;
    onClose: () => void;
    onContinue: () => void;
    onStartNew: () => void;
    pendingSessionData: ClassStudySession | null;
}

const ClassResumeSessionModal: React.FC<ClassResumeSessionModalProps> = ({
    open,
    onClose,
    onContinue,
    onStartNew,
    pendingSessionData
}) => {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className='max-w-md w-full'>
                <div className='text-center py-6'>
                    <div className='mb-4'>
                        <div className='mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                            <Clock className='h-6 w-6 text-blue-600' />
                        </div>
                        <h3 className='text-lg font-semibold mb-2'>Unfinished Session</h3>
                        <p className='text-muted-foreground text-sm'>
                            You have an unfinished study session for this deck. Continue or start a new one?
                        </p>
                    </div>

                    {pendingSessionData && (
                        <div className='mb-6 p-3 bg-muted rounded-lg'>
                            <p className='text-sm'>
                                <strong>{pendingSessionData.completedCardIds?.length || 0}</strong> flashcards completed
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                                Started: {new Date(pendingSessionData.startTime).toLocaleString('en-US')}
                            </p>
                        </div>
                    )}

                    <div className='flex gap-3'>
                        <Button variant='outline' onClick={onStartNew} className='flex-1'>
                            Start New
                        </Button>
                        <Button onClick={onContinue} className='flex-1'>
                            Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClassResumeSessionModal;
