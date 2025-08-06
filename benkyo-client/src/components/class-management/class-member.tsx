import { useState } from 'react';
import { UserPlus, Mail, UserX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ConfirmDeleteUserModal from '@/components/modals/confirm-delete-user-modal';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import useInviteMemberClass from '@/hooks/queries/use-invite-member-class';
import useRemoveUserClass from '@/hooks/queries/use-remove-user-class';
import useGetClassMember from '@/hooks/queries/use-get-class-member';
import { getToast } from '@/utils/getToast';

interface ClassMemberProps {
    onMemberChange?: () => void;
}

export const ClassMember = ({ onMemberChange }: ClassMemberProps) => {
    const { classData } = useClassManagementStore();
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToRemove, setUserToRemove] = useState<string | null>(null);

    const { data: members, isLoading, error, refetch } = useGetClassMember(classData?._id || '');

    const { mutateAsync: inviteMember } = useInviteMemberClass();
    const { mutateAsync: removeUser } = useRemoveUserClass();

    const handleInviteMember = async () => {
        if (!inviteEmail.trim()) {
            getToast('error', 'Please enter an email address');
            return;
        }

        if (!classData?._id) {
            getToast('error', 'Class data not available');
            return;
        }

        setIsInviting(true);
        try {
            await inviteMember(
                { classId: classData._id, inviteEmail: inviteEmail.trim() },
                {
                    onSuccess: () => {
                        getToast('success', 'Invitation sent successfully');
                        setInviteEmail('');
                        refetch();
                        onMemberChange?.();
                    },
                    onError: (error) => {
                        getToast('error', error.message);
                        console.log(error);
                    }
                }
            );
        } catch (error) {
            getToast('error', 'Failed to send invitation');
            console.log(error);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!classData?._id) {
            getToast('error', 'Class data not available');
            return;
        }

        setUserToRemove(userId);
        setShowConfirmModal(true);
    };

    const confirmRemoveMember = async () => {
        if (!classData?._id || !userToRemove) {
            return;
        }

        removeUser(
            { classId: classData._id, userId: userToRemove },
            {
                onSuccess: () => {
                    getToast('success', 'Member removed successfully');
                    refetch();
                    onMemberChange?.();
                    setShowConfirmModal(false);
                    setUserToRemove(null);
                },
                onError: (error) => {
                    getToast('error', error.message);
                    console.log(error);
                }
            }
        );
    };

    if (!classData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <UserPlus className='w-5 h-5' />
                        Members
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <UserPlus className='w-5 h-5' />
                        Members ({members?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='invite-email'>Invite Member by Email</Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='invite-email'
                                    type='email'
                                    placeholder='Enter email address'
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleInviteMember();
                                        }
                                    }}
                                />
                                <Button onClick={handleInviteMember} disabled={isInviting || !inviteEmail.trim()}>
                                    <Mail className='w-4 h-4 mr-2' />
                                    {isInviting ? 'Inviting...' : 'Invite'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='text-center py-8 text-muted-foreground'>Loading members...</div>
                    ) : error ? (
                        <div className='text-center py-8 text-muted-foreground'>Error loading members</div>
                    ) : !members || members.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                            <UserPlus className='w-8 h-8 mx-auto mb-2 opacity-50' />
                            <p>No members found</p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {members.map((member: any) => (
                                <div
                                    key={member._id}
                                    className='flex items-center justify-between p-4 bg-muted/30 rounded-lg border'
                                >
                                    <div className='flex items-center gap-4 flex-1'>
                                        <Avatar className='w-10 h-10'>
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback className='text-sm'>
                                                {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-medium text-foreground truncate'>
                                                {member.name || 'Unknown User'}
                                            </div>
                                            <div className='text-sm text-muted-foreground truncate'>{member.email}</div>
                                            <div className='flex items-center gap-2 mt-1'>
                                                {member.role === 'OWNER' && (
                                                    <Badge variant='default' className='text-xs'>
                                                        Owner
                                                    </Badge>
                                                )}
                                                {member.role === 'MEMBER' && (
                                                    <Badge variant='secondary' className='text-xs'>
                                                        Member
                                                    </Badge>
                                                )}
                                                {member.joinedAt && (
                                                    <Badge variant='outline' className='text-xs'>
                                                        <Clock className='w-3 h-3 mr-1' />
                                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {member.role !== 'OWNER' && (
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='border-red-300 text-red-600 hover:bg-red-50'
                                            onClick={() => handleRemoveMember(member._id)}
                                        >
                                            <UserX className='w-4 h-4 mr-1' />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDeleteUserModal
                open={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setUserToRemove(null);
                }}
                onConfirm={confirmRemoveMember}
            />
        </>
    );
};
