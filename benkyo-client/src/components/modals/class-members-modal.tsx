import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Member = {
    _id: string;
    avatar: string;
    email: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: Member[];
    ownerId: string;
    onRemoveUser: (userId: string) => void;
};

const ClassMembersModal = ({ open, onOpenChange, users, ownerId, onRemoveUser }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
            <DialogHeader>
                <DialogTitle>Class Members</DialogTitle>
            </DialogHeader>
            <div className='space-y-3 max-h-60 overflow-y-auto'>
                {users.length > 0 ? (
                    users.map((member) => (
                        <div key={member._id} className='flex items-center gap-3 p-2 border rounded-md justify-between'>
                            <div className='flex items-center gap-3'>
                                <img src={member.avatar} alt={member.email} className='w-8 h-8 rounded-full' />
                                <span className='text-sm font-medium truncate'>{member.email}</span>
                            </div>
                            {member._id !== ownerId && (
                                <Button variant='destructive' size='sm' onClick={() => onRemoveUser(member._id)}>
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className='text-sm text-muted-foreground'>No members found.</p>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

export default ClassMembersModal;
