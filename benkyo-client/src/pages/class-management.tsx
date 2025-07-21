import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserX, Users, Calendar, Eye, Settings, Play, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import StatCard from '@/components/stat-card';
import JoinRequestsSection from '@/components/join-request.section';

import useAuthStore from '@/hooks/stores/use-auth-store';
import useDeleteclass from '@/hooks/queries/use-delete-class';
import useGetClassManagemenById from '@/hooks/queries/use-get-class-management-id';
import useAcceptJoinClass from '@/hooks/queries/use-accept-join-request';
import useRejectJoinClass from '@/hooks/queries/use-reject-join-request';
import useInviteMemberToClassApi from '@/hooks/queries/use-invite-member-class';
import useRemoveUserFromClass from '@/hooks/queries/use-remove-user-class';

import { getToast } from '@/utils/getToast';
import useGetDeckToAddClass from '@/hooks/queries/use-get-decks-to-class';
import AddDeckDialog from '@/components/add-deck-dialog';
import useRemoveDeckFromClass from '@/hooks/queries/use-remove-deck-from-class';
import ClassMembersModal from '@/components/modals/class-members-modal';
import CreateQuizModal from '@/components/modals/create-quiz.modal';
import InviteMemberModal from '@/components/modals/invite-member-modal';
import CreateScheduleModal from '@/components/modals/create-schedule-modal';
import ConfirmDeleteUserModal from '@/components/modals/confirm-delete-user-modal';
import ConfirmDeleteClassModal from '@/components/modals/confirm-delete-class-modal';
import ConfirmDeleteDeckModal from '@/components/modals/confirm-delete-deck-modal';
import ClassDecksModal from '@/components/modals/class-decks-modal';

const UserClassManagement = () => {
    const { _id = '' } = useParams();
    const classId = _id;
    const navigate = useNavigate();

    const [inviteEmail, setInviteEmail] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddDeckDialog, setShowAddDeckDialog] = useState(false);
    const [showCreateQuizDialog, setShowCreateQuizDialog] = useState(false);
    const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showMembersDialog, setShowMembersDialog] = useState(false);
    const [showDecksDialog, setShowDecksDialog] = useState(false);
    const [removeUserId, setRemoveUserId] = useState<string | null>(null);
    const [removeDeckId, setRemoveDeckId] = useState<string | null>(null);

    const { user } = useAuthStore((store) => store);
    const { data: classItem, isLoading, isError, refetch } = useGetClassManagemenById(classId);
    const { mutateAsync: acceptRequest } = useAcceptJoinClass();
    const { mutateAsync: rejectRequest } = useRejectJoinClass();
    const { mutateAsync: inviteMember } = useInviteMemberToClassApi();
    const { mutateAsync: deleteClass } = useDeleteclass();
    const { mutateAsync: removeUserFromClass } = useRemoveUserFromClass();
    const { mutateAsync: removeDeckFromClass } = useRemoveDeckFromClass();
    const { data: availableDecks = [], refetch: getNewDeck } = useGetDeckToAddClass(classId);

    if (classItem && classItem.owner.email !== user?.email) {
        navigate('/class/list');
        return null;
    }

    const handleAccept = async (userId: string) => {
        if (!classId) return;
        try {
            await acceptRequest({ classId, userId });
            await refetch();
            getToast('success', 'Join request accepted.');
        } catch (error) {
            getToast('error', 'Failed to accept join request. Please try again.');
        }
    };

    const handleRemoveDeck = (deckId: string) => {
        setRemoveDeckId(deckId);
    };

    const handleReject = async (userId: string) => {
        if (!classId) return;
        try {
            await rejectRequest({ classId, userId });
            await refetch();
            getToast('success', 'Join request rejected.');
        } catch (error) {
            getToast('error', 'Failed to reject join request. Please try again.');
        }
    };

    const handleInviteMember = async () => {
        if (!classId || !inviteEmail) return;
        try {
            await inviteMember({ classId, inviteEmail });
            await refetch();
            getToast('success', 'Member invited successfully!');
            setShowInviteDialog(false);
            setInviteEmail('');
        } catch {
            getToast('error', 'Member invitation failed. Please try again.');
        }
    };

    const handleRemoveUser = (userId: string) => {
        setRemoveUserId(userId);
    };

    const handleConfirmRemoveDeck = async () => {
        if (!removeDeckId || !classId) return;
        try {
            await removeDeckFromClass({ classId, deckId: removeDeckId });
            await refetch();
            getToast('success', 'Deck removed successfully.');
        } catch {
            getToast('error', 'Unable to remove deck from class.');
        } finally {
            setRemoveDeckId(null);
        }
    };

    const handleConfirmRemoveUser = async () => {
        if (!removeUserId) return;
        try {
            await removeUserFromClass({ classId, userId: removeUserId });
            getToast('success', 'User removed from class successfully!');
            await refetch();
        } catch {
            getToast('error', 'Unable to remove user from class.');
        } finally {
            setRemoveUserId(null);
        }
    };

    const handleDeleteConfirmClass = async () => {
        if (!classId) return;
        try {
            await deleteClass(classId);
            getToast('success', 'Class deleted successfully!');
            navigate('/class/list');
        } catch (error) {
            getToast('error', 'Failed to delete class.');
        }
    };

    useEffect(() => {
        if (isLoading || !user?._id) return;
        if (isError || !classItem) {
            navigate('/');
            return;
        }

        if (classItem.owner._id !== user._id) {
            getToast('error', 'You are not authorized to access this class.');
            navigate('/class/list');
        }
    }, [isLoading, isError, classItem, user?._id, navigate]);

    if (isLoading) return <p className='text-center mt-10 text-gray-500'>Loading class...</p>;

    if (!classItem) {
        getToast('error', 'Class not found.');
        navigate('/class/list');
        return;
    }

    return (
        <div className='min-h-screen bg-background'>
            <div className='container mx-auto px-4 py-8 max-w-6xl'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                    <div className='w-full flex gap-3 justify-end'>
                        <Button onClick={() => navigate(`/class/${classId}/update`)} className='px-6'>
                            <Settings className='w-4 h-4 mr-2' />
                            Update Class
                        </Button>
                        <Button variant='destructive' className='px-6' onClick={() => setShowDeleteDialog(true)}>
                            <UserX className='w-4 h-4 mr-2' />
                            Delete Class
                        </Button>
                    </div>
                </div>

                <Card className='overflow-hidden mb-8 relative h-48'>
                    <img
                        src={classItem.bannerUrl}
                        alt={classItem.name}
                        className='w-full h-full object-cover absolute inset-0'
                    />
                    <div className='absolute inset-0 bg-black/50' />
                    <div className='relative z-10 h-full flex flex-col justify-center px-6 text-white'>
                        <h1 className='text-3xl font-bold mb-2 truncate'>{classItem.name}</h1>
                        <p className='text-base max-w-3xl line-clamp-2'>{classItem.description}</p>
                        <div className='flex items-center gap-2 text-sm mt-2'>
                            <Badge variant='outline' className='text-white border-white'>
                                {classItem.visibility}
                            </Badge>
                            <span className='opacity-75'>•</span>
                            <span className='opacity-75'>ID: {classItem._id}</span>
                        </div>
                    </div>
                </Card>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <div onClick={() => setShowMembersDialog(true)} className='cursor-pointer'>
                        <StatCard icon={Users} label='Members' value={classItem.users?.length || 0} />
                    </div>
                    <div onClick={() => setShowDecksDialog(true)} className='cursor-pointer'>
                        <StatCard icon={Settings} label='Decks' value={classItem.decks?.length || 0} />
                    </div>

                    <StatCard icon={Eye} label='Visits' value={classItem.visited?.count || 0} />
                    <StatCard icon={Calendar} label='Tracked States' value={classItem.userClassStates?.length || 0} />
                </div>
                <div className='w-full flex flex-wrap items-center justify-center sm:justify-start gap-3 border-b pb-4 mb-6'>
                    <Button variant='outline' onClick={() => setShowInviteDialog(true)}>
                        <Users className='w-4 h-4 mr-2' /> Invite Members
                    </Button>
                    <Button variant='outline' onClick={() => setShowAddDeckDialog(true)}>
                        <Plus className='w-4 h-4 mr-2' /> Add Deck
                    </Button>
                    <Button variant='outline' onClick={() => setShowCreateQuizDialog(true)}>
                        <Play className='w-4 h-4 mr-2' /> Create Quiz
                    </Button>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <AddDeckDialog
                        open={showAddDeckDialog}
                        onOpenChange={setShowAddDeckDialog}
                        classId={classId}
                        existingDecks={availableDecks}
                        onAddSuccess={async () => {
                            await refetch();
                            await getNewDeck();
                        }}
                    />

                    <CreateQuizModal open={showCreateQuizDialog} onOpenChange={setShowCreateQuizDialog} />

                    <InviteMemberModal
                        open={showInviteDialog}
                        onOpenChange={setShowInviteDialog}
                        email={inviteEmail}
                        setEmail={setInviteEmail}
                        onInvite={handleInviteMember}
                    />

                    <CreateScheduleModal
                        open={showCreateScheduleDialog}
                        onOpenChange={setShowCreateScheduleDialog}
                        onCreate={(title, description) => {
                            console.log('Create schedule:', title, description);
                        }}
                    />

                    <ClassMembersModal
                        open={showMembersDialog}
                        onOpenChange={setShowMembersDialog}
                        users={classItem.users}
                        ownerId={classItem.owner._id}
                        onRemoveUser={handleRemoveUser}
                    />

                    <ClassDecksModal
                        open={showDecksDialog}
                        onOpenChange={setShowDecksDialog}
                        decks={classItem.decks}
                        onRemoveDeck={handleRemoveDeck}
                        onDeckClick={(deckId) => navigate(`/deck/${deckId}`)}
                    />

                    <ConfirmDeleteDeckModal
                        open={!!removeDeckId}
                        onClose={() => setRemoveDeckId(null)}
                        onConfirm={handleConfirmRemoveDeck}
                    />

                    <ConfirmDeleteUserModal
                        open={!!removeUserId}
                        onClose={() => setRemoveUserId(null)}
                        onConfirm={handleConfirmRemoveUser}
                    />

                    <ConfirmDeleteClassModal
                        open={showDeleteDialog}
                        className={classItem.name}
                        onClose={() => setShowDeleteDialog(false)}
                        onConfirm={handleDeleteConfirmClass}
                    />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Details</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-muted-foreground'>Owner</span>
                                    <span className='font-medium'>
                                        {classItem.owner?.name || classItem.owner?.email || 'Unknown'}
                                    </span>
                                </div>
                                <Separator />
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-muted-foreground'>Requires Approval</span>
                                    <Badge variant={classItem.requiredApprovalToJoin ? 'default' : 'secondary'}>
                                        {classItem.requiredApprovalToJoin ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <Separator />
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-muted-foreground'>Created</span>
                                    <span className='text-sm'>
                                        {new Date(classItem.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-muted-foreground'>Last Updated</span>
                                    <span className='text-sm'>
                                        {new Date(classItem.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Eye className='w-5 h-5' />
                                Recent Visits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {classItem.visited?.history && classItem.visited.history.length > 0 ? (
                                <div className='space-y-3'>
                                    {classItem.visited.history.slice(0, 5).map((visit: any, i: number) => (
                                        <div
                                            key={i}
                                            className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'
                                        >
                                            <span className='font-medium'>{visit.userId?.email || 'Unknown User'}</span>
                                            <span className='text-sm text-muted-foreground'>
                                                {visit.lastVisit
                                                    ? new Date(visit.lastVisit).toLocaleDateString()
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    ))}
                                    {classItem.visited.history.length > 5 && (
                                        <div className='text-sm text-muted-foreground text-center pt-2'>
                                            And {classItem.visited.history.length - 5} more visits...
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='text-center py-8 text-muted-foreground'>
                                    <Eye className='w-8 h-8 mx-auto mb-2 opacity-50' />
                                    <p>No visit history yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <JoinRequestsSection classItem={classItem} onAccept={handleAccept} onReject={handleReject} />
            </div>
        </div>
    );
};

export default UserClassManagement;
