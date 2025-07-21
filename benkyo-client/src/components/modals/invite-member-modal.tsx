import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    setEmail: (email: string) => void;
    onInvite: () => void;
};

const InviteMemberModal = ({ open, onOpenChange, email, setEmail, onInvite }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
                <Label>Please enter email member you want to invite</Label>
                <Input placeholder='Enter email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button className='w-full' onClick={onInvite}>
                    Invite
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);

export default InviteMemberModal;
