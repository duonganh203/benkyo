import { useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
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
import type { ClassMembersResponse } from '@/types/class';

interface ClassMemberProps {
    onMemberChange?: () => void;
}

export const ClassMember = ({ onMemberChange }: ClassMemberProps) => {
    const { classData } = useClassManagementStore();
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToRemove, setUserToRemove] = useState<string | null>(null);

    const { data: initialMembers, refetch: refetchMembersOnce } = useGetClassMember(classData?._id || '');

    const {
        data: pagedMembers,
        isLoading,
        hasNextPage,
        fetchNextPage,
        error
    } = useGetClassMember(classData?._id || '', 5);

    const members: ClassMembersResponse = useMemo(() => {
        if (!pagedMembers) return (initialMembers ?? []) as ClassMembersResponse;
        return pagedMembers.pages.flatMap((page) => page.data) as ClassMembersResponse;
    }, [pagedMembers, initialMembers]);

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

        try {
            await inviteMember({ classId: classData._id, inviteEmail: inviteEmail.trim() });
        } catch (error) {
            console.log('Error when invite member to class');
        } finally {
            setIsInviting(false);
        }
        setInviteEmail('');
        refetchMembersOnce();
        onMemberChange?.();
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
        await removeUser({ classId: classData._id, userId: userToRemove });
        await refetchMembersOnce();
        onMemberChange?.();
        setShowConfirmModal(false);
        setUserToRemove(null);
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
                            <Label htmlFor='invite-email'>
                                Invite Member by Email
                                <span className='text-red-500 ml-0.5'>*</span>
                            </Label>
                            <p className='text-xs text-muted-foreground'>
                                Please enter the full email address of the member you want to invite.
                            </p>
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
                        <div id='class-members-scrollable' className='space-y-4 max-h-[400px] overflow-y-auto pr-1'>
                            <InfiniteScroll
                                dataLength={members.length}
                                next={() => fetchNextPage()}
                                hasMore={!!hasNextPage}
                                loader={
                                    <div className='flex justify-center py-2 text-xs text-muted-foreground'>
                                        Loading more members...
                                    </div>
                                }
                                scrollableTarget='class-members-scrollable'
                                style={{ overflow: 'visible' }}
                            >
                                {members.map((member: ClassMembersResponse[number]) => (
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
                                                <div className='text-sm text-muted-foreground truncate'>
                                                    {member.email}
                                                </div>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <Badge variant='outline' className='text-xs'>
                                                        <Clock className='w-3 h-3 mr-1' />
                                                        Member
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        {classData?.owner?._id !== member._id && (
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
                            </InfiniteScroll>
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
