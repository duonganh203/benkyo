import { Users, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useGetClassMemberProgress from '@/hooks/queries/use-get-class-member-progress';
import { MemberProgress } from '@/types/class';

interface ClassMemberProgressModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classId: string;
}

const formatTimeRemaining = (hours: number | undefined) => {
    if (!hours) return '';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
};

const MemberProgressCard = ({ member }: { member: MemberProgress }) => {
    return (
        <Card className='mb-4'>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                            <img
                                src={member.userAvatar || '/default-avatar.png'}
                                alt={member.userName}
                                className='object-cover'
                            />
                        </Avatar>
                        <div>
                            <h4 className='font-semibold'>{member.userName}</h4>
                            <p className='text-sm text-muted-foreground'>{member.userEmail}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        {member.overdueCount > 0 && (
                            <Badge variant='destructive' className='flex items-center gap-1'>
                                <AlertTriangle className='w-3 h-3' />
                                {member.overdueCount} Overdue
                            </Badge>
                        )}
                        {member.upcomingCount > 0 && (
                            <Badge variant='secondary' className='flex items-center gap-1'>
                                <Clock className='w-3 h-3' />
                                {member.upcomingCount} Upcoming
                            </Badge>
                        )}
                        <Badge variant={member.overallProgress >= 80 ? 'default' : 'secondary'}>
                            {member.overallProgress}% Overall
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {member.deckProgresses.length === 0 ? (
                    <p className='text-muted-foreground text-center py-4'>No scheduled decks</p>
                ) : (
                    <div className='space-y-3'>
                        {member.deckProgresses.map((deck) => (
                            <div key={deck.deckId} className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <h5 className='font-medium text-sm'>{deck.deckName}</h5>
                                        {deck.description && (
                                            <p className='text-xs text-muted-foreground'>{deck.description}</p>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        {deck.isOverdue ? (
                                            <Badge variant='destructive' className='text-xs'>
                                                {formatTimeRemaining(deck.hoursOverdue)} Overdue
                                            </Badge>
                                        ) : deck.hoursUntilDeadline !== undefined && deck.hoursUntilDeadline <= 24 ? (
                                            <Badge variant='secondary' className='text-xs'>
                                                {formatTimeRemaining(deck.hoursUntilDeadline)} Left
                                            </Badge>
                                        ) : null}
                                        <span className='text-sm font-medium'>{deck.progress}%</span>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <Progress value={deck.progress} className='h-2' />
                                    <div className='flex justify-between text-xs text-muted-foreground'>
                                        <span>
                                            {deck.completedCards} / {deck.totalCards} cards
                                        </span>
                                        {deck.endTime && (
                                            <span className='flex items-center gap-1'>
                                                <Calendar className='w-3 h-3' />
                                                Due: {new Date(deck.endTime).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ClassMemberProgressModal = ({ open, onOpenChange, classId }: ClassMemberProgressModalProps) => {
    const { data: memberProgresses, isLoading, error } = useGetClassMemberProgress(classId);

    if (error) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Users className='w-5 h-5' />
                            Member Progress
                        </DialogTitle>
                    </DialogHeader>
                    <div className='text-center py-8'>
                        <AlertTriangle className='w-12 h-12 mx-auto mb-4 text-destructive' />
                        <p className='text-muted-foreground'>Failed to load member progress</p>
                        <p className='text-sm text-muted-foreground mt-1'>
                            {error.response?.data?.message || 'An error occurred'}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        Member Progress
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className='text-center py-8'>
                        <div className='animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4' />
                        <p className='text-muted-foreground'>Loading member progress...</p>
                    </div>
                ) : !memberProgresses || !Array.isArray(memberProgresses) || memberProgresses.length === 0 ? (
                    <div className='text-center py-8'>
                        <Users className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                        <p className='text-muted-foreground'>No members found</p>
                    </div>
                ) : (
                    <div className='overflow-y-auto max-h-[60vh] pr-2'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                            <Card>
                                <CardContent className='p-4 text-center'>
                                    <div className='text-2xl font-bold'>{memberProgresses.length}</div>
                                    <div className='text-sm text-muted-foreground'>Total Members</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className='p-4 text-center'>
                                    <div className='text-2xl font-bold text-destructive'>
                                        {memberProgresses.filter((m) => m.overdueCount > 0).length}
                                    </div>
                                    <div className='text-sm text-muted-foreground'>With Overdue</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className='p-4 text-center'>
                                    <div className='text-2xl font-bold text-orange-500'>
                                        {memberProgresses.filter((m) => m.upcomingCount > 0).length}
                                    </div>
                                    <div className='text-sm text-muted-foreground'>With Upcoming</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className='p-4 text-center'>
                                    <div className='text-2xl font-bold text-green-500'>
                                        {Math.round(
                                            memberProgresses.reduce((acc, m) => acc + m.overallProgress, 0) /
                                                memberProgresses.length
                                        )}
                                        %
                                    </div>
                                    <div className='text-sm text-muted-foreground'>Avg Progress</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className='my-4' />

                        <div className='space-y-4'>
                            {memberProgresses.map((member) => (
                                <MemberProgressCard key={member.userId} member={member} />
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ClassMemberProgressModal;
