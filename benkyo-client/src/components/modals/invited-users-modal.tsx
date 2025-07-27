import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, User } from 'lucide-react';
import useCancelInvite from '@/hooks/queries/use-cancel-invite';
import { getToast } from '@/utils/getToast';
import { ClassUser } from '@/types/class';

interface InvitedUser {
    user: ClassUser;
    invitedAt: string;
}

interface InvitedUsersModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invitedUsers: InvitedUser[];
    classId: string;
    refetch: () => void;
}

const InvitedUsersModal = ({ open, onOpenChange, invitedUsers, classId, refetch }: InvitedUsersModalProps) => {
    const { mutateAsync: cancelInvite, isPending } = useCancelInvite();

    const handleCancelInvite = async (userId: string) => {
        if (!classId) return;
        try {
            await cancelInvite({ classId, userId });
            await refetch();
            getToast('success', 'Invite cancelled successfully.');
        } catch (error) {
            getToast('error', 'Failed to cancel invite. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Mail className='w-5 h-5' />
                        Invited Users ({invitedUsers.length})
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                    {invitedUsers.length === 0 ? (
                        <div className='text-center py-8'>
                            <User className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
                            <p className='text-muted-foreground'>No invited users</p>
                        </div>
                    ) : (
                        invitedUsers.map((invitedUser) => {
                            return (
                                <Card key={invitedUser.user._id}>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <Avatar className='w-10 h-10'>
                                                    <AvatarImage
                                                        src={invitedUser.user.avatar}
                                                        alt={invitedUser.user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {invitedUser.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className='font-medium'>{invitedUser.user.name}</p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        {invitedUser.user.email}
                                                    </p>
                                                    <Badge variant='secondary' className='mt-1'>
                                                        Invited {new Date(invitedUser.invitedAt).toLocaleDateString()}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => handleCancelInvite(invitedUser.user._id)}
                                                disabled={isPending}
                                                className='text-destructive hover:text-destructive'
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvitedUsersModal;
