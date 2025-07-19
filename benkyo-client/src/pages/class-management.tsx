import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserX, UserCheck, Users, Calendar, Eye, Settings, Play, CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getToast } from '@/utils/getToast';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useDeleteclass from '@/hooks/queries/use-delete-class';
import useGetClassManagemenById from '@/hooks/queries/use-get-class-management-id';
import useAcceptJoinClass from '@/hooks/queries/use-accept-join-request';
import useRejectJoinClass from '@/hooks/queries/use-reject-join-request';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { Label } from '@radix-ui/react-label';

const ConfirmDeleteDialog = ({
    open,
    className,
    onClose,
    onConfirm
}: {
    open: boolean;
    className: string;
    onClose: () => void;
    onConfirm: () => void;
}) => {
    const [input, setInput] = useState('');

    const handleConfirm = () => {
        if (input === className) {
            onConfirm();
            setInput('');
        }
    };

    const handleClose = () => {
        setInput('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Confirm Class Deletion</DialogTitle>
                </DialogHeader>
                <p className='text-sm text-muted-foreground'>
                    To confirm, type the class name <strong>"{className}"</strong> below.
                </p>
                <Input placeholder='Enter class name' value={input} onChange={(e) => setInput(e.target.value)} />
                <DialogFooter>
                    <Button variant='outline' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant='destructive' disabled={input !== className} onClick={handleConfirm}>
                        Delete Class
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const JoinRequestsSection = ({ classItem, onAccept, onReject }: any) => {
    if (!classItem.joinRequests || classItem.joinRequests.length === 0) return null;

    return (
        <Card className='mt-6'>
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Users className='w-5 h-5' />
                    Join Requests ({classItem.joinRequests.length})
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                {classItem.joinRequests.map((request: any) => (
                    <div
                        key={request._id}
                        className='flex items-center justify-between p-4 bg-muted/50 rounded-lg border'
                    >
                        <div className='flex items-center gap-4 flex-1'>
                            <Avatar className='w-12 h-12'>
                                <AvatarImage src={request.user?.avatar} alt={request.user?.name} />
                                <AvatarFallback className='text-sm'>
                                    {request.user?.name
                                        ?.split(' ')
                                        .map((n: any) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <div className='font-semibold text-foreground truncate'>{request.user?.name}</div>
                                <div className='text-sm text-muted-foreground truncate'>{request.user?.email}</div>
                                {request.message && (
                                    <div className='text-sm text-muted-foreground mt-1 italic line-clamp-2'>
                                        "{request.message}"
                                    </div>
                                )}
                                <div className='text-xs text-muted-foreground mt-1'>
                                    {new Date(request.requestDate).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-2 ml-4'>
                            <Button
                                size='sm'
                                className='bg-green-600 hover:bg-green-700'
                                onClick={() => onAccept(request._id)}
                            >
                                <UserCheck className='w-4 h-4 mr-1' />
                                Accept
                            </Button>
                            <Button size='sm' variant='destructive' onClick={() => onReject(request._id)}>
                                <UserX className='w-4 h-4 mr-1' />
                                Reject
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const StatCard = ({ icon: Icon, label, value }: any) => (
    <Card className='p-4 min-w-0'>
        <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg flex-shrink-0'>
                <Icon className='w-5 h-5 text-primary' />
            </div>
            <div className='flex-1 min-w-0'>
                <div className='text-2xl font-bold'>{value}</div>
                <div className='text-sm text-muted-foreground font-medium'>{label}</div>
            </div>
        </div>
    </Card>
);

const UserClassManagement = () => {
    const { _id = '' } = useParams();
    const classId = _id;
    const navigate = useNavigate();
    const { user } = useAuthStore((store) => store);
    const { data: classItem, isLoading, isError, refetch } = useGetClassManagemenById(classId);
    const { mutateAsync: acceptRequest } = useAcceptJoinClass();
    const { mutateAsync: rejectRequest } = useRejectJoinClass();
    const { mutateAsync: deleteClass } = useDeleteclass();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddDeskDialog, setShowAddDeskDialog] = useState(false);
    const [showCreateQuizDialog, setShowCreateQuizDialog] = useState(false);
    const [showCreateScheduleDialog, setShowCreateScheduleDialog] = useState(false);
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    const isOwner =
        user?._id &&
        classItem &&
        ((typeof classItem.owner === 'string' && classItem.owner === user._id) ||
            (typeof classItem.owner === 'object' && classItem.owner._id === user._id));

    const handleAccept = async (userId: string) => {
        if (!classId) return;
        await acceptRequest({ classId, userId });
        await refetch();
        getToast('success', 'Join request accepted.');
    };

    const handleReject = async (userId: string) => {
        if (!classId) return;
        await rejectRequest({ classId, userId });
        await refetch();
        getToast('success', 'Join request rejected.');
    };

    const handleDeleteConfirm = async () => {
        if (!classItem) return;
        await deleteClass(classId);
        getToast('success', 'Class deleted successfully!');
        navigate('/');
    };

    useEffect(() => {
        if (isLoading || !user?._id) return;
        if (isError || !classItem) {
            navigate('/');
            return;
        }
        const validOwner =
            (typeof classItem.owner === 'string' && classItem.owner === user._id) ||
            (typeof classItem.owner === 'object' && classItem.owner?._id === user._id);
        if (!validOwner) {
            getToast('error', 'You are not authorized to access this class.');
            navigate('/');
        }
    }, [isLoading, isError, classItem, user?._id, navigate]);

    if (isLoading) return <p className='text-center mt-10 text-gray-500'>Loading class...</p>;
    if (!isOwner || !classItem) return null;

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
                    <StatCard icon={Users} label='Members' value={classItem.users?.length || 0} />
                    <StatCard icon={Settings} label='Desks' value={classItem.desks?.length || 0} />
                    <StatCard icon={Eye} label='Visits' value={classItem.visited?.count || 0} />
                    <StatCard icon={Calendar} label='Tracked States' value={classItem.userClassStates?.length || 0} />
                </div>
                <div className='w-full flex flex-wrap items-center justify-center sm:justify-start gap-3 border-b pb-4 mb-6'>
                    <Button variant='outline' onClick={() => setShowInviteDialog(true)}>
                        <Users className='w-4 h-4 mr-2' /> Invite Members
                    </Button>
                    <Button variant='outline' onClick={() => setShowAddDeskDialog(true)}>
                        <Plus className='w-4 h-4 mr-2' /> Add Desk
                    </Button>
                    <Button variant='outline' onClick={() => setShowCreateScheduleDialog(true)}>
                        <CalendarIcon className='w-4 h-4 mr-2' /> Create Schedule Learning
                    </Button>
                    <Button variant='outline' onClick={() => setShowCreateQuizDialog(true)}>
                        <Play className='w-4 h-4 mr-2' /> Create Quiz
                    </Button>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <Dialog open={showAddDeskDialog} onOpenChange={setShowAddDeskDialog}>
                        <DialogContent className='sm:max-w-md'>
                            <DialogHeader>
                                <DialogTitle>Select Desk to Add</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-3 max-h-60 overflow-y-auto'>
                                {classItem.desks?.map((desk: any) => (
                                    <div
                                        key={desk._id}
                                        className='p-2 border rounded-md flex justify-between items-center'
                                    >
                                        <div className='font-medium truncate'>{desk.name}</div>
                                        <Button size='sm'>Add</Button>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showCreateQuizDialog} onOpenChange={setShowCreateQuizDialog}>
                        <DialogContent className='sm:max-w-md'>
                            <DialogHeader>
                                <DialogTitle>Create Quiz</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <Label>Quiz Name</Label>
                                <Input placeholder='Enter quiz name' />
                                <Label>Select Desk</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Choose desk' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classItem.desks?.map((desk: any) => (
                                            <SelectItem key={desk._id} value={desk._id}>
                                                {desk.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button className='w-full'>Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogContent className='sm:max-w-md'>
                            <DialogHeader>
                                <DialogTitle>Invite Member</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <Label>Please enter email member you want to invite</Label>
                                <Input placeholder='Enter email' />
                                <Button className='w-full'>Invite</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showCreateScheduleDialog} onOpenChange={setShowCreateScheduleDialog}>
                        <DialogContent className='sm:max-w-md'>
                            <DialogHeader>
                                <DialogTitle>Create Schedule</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <Label>Schedule Title</Label>
                                <Input placeholder='Enter title' />
                                <Label>Description</Label>
                                <Textarea placeholder='Enter description' />
                                <Button className='w-full'>Create</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
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
                                        {classItem.owner?.fullName || classItem.owner?.email || 'Unknown'}
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

                <ConfirmDeleteDialog
                    open={showDeleteDialog}
                    className={classItem.name}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={handleDeleteConfirm}
                />
            </div>
        </div>
    );
};

export default UserClassManagement;
