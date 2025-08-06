import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useGetClassMemberLearningStatus } from '@/hooks/queries/use-get-class-member-learning-status';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import { useNavigate } from 'react-router-dom';
import { getToast } from '@/utils/getToast';

const getStatusColor = (status: 'completed' | 'in_progress' | 'not_started') => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'not_started':
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getStatusIcon = (status: 'completed' | 'in_progress' | 'not_started') => {
    switch (status) {
        case 'completed':
            return <CheckCircle className='w-4 h-4' />;
        case 'in_progress':
            return <Clock className='w-4 h-4' />;
        case 'not_started':
            return <BookOpen className='w-4 h-4' />;
    }
};

export const ClassMemberLearningStatus = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { classData } = useClassManagementStore();

    if (!classData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        Member Learning Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                </CardContent>
            </Card>
        );
    }

    const { data: memberStatuses, isLoading, isError, error } = useGetClassMemberLearningStatus(classData._id);

    if (!user) {
        navigate('/login');
        getToast('error', 'You must be logged in to continue.');
        return null;
    }

    if (isError) {
        getToast('error', `${error?.message}`);
        console.log(error);
        return null;
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        Member Learning Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Loading member learning status...</div>
                </CardContent>
            </Card>
        );
    }

    if (!memberStatuses || memberStatuses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        Member Learning Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>
                        <Users className='w-8 h-8 mx-auto mb-2 opacity-50' />
                        <p>No members found</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Users className='w-5 h-5' />
                    Member Learning Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {memberStatuses.map((member) => (
                        <div key={member.userId} className='border rounded-lg p-4'>
                            <div className='flex items-center gap-3 mb-4'>
                                <div className='w-10 h-10 rounded-full overflow-hidden'>
                                    <img
                                        src={member.userAvatar || '/default-avatar.png'}
                                        alt={member.userName}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div className='flex-1'>
                                    <h3 className='font-semibold text-lg'>{member.userName}</h3>
                                    <p className='text-sm text-muted-foreground'>{member.userEmail}</p>
                                </div>
                                <div className='text-right'>
                                    <div className='text-2xl font-bold text-blue-600'>{member.overallProgress}%</div>
                                    <div className='text-xs text-muted-foreground'>Overall Progress</div>
                                </div>
                            </div>

                            <div className='grid grid-cols-4 gap-4 mb-4'>
                                <div className='text-center'>
                                    <div className='text-lg font-semibold text-green-600'>{member.completedDecks}</div>
                                    <div className='text-xs text-muted-foreground'>Completed</div>
                                </div>
                                <div className='text-center'>
                                    <div className='text-lg font-semibold text-blue-600'>{member.inProgressDecks}</div>
                                    <div className='text-xs text-muted-foreground'>In Progress</div>
                                </div>
                                <div className='text-center'>
                                    <div className='text-lg font-semibold text-gray-600'>{member.notStartedDecks}</div>
                                    <div className='text-xs text-muted-foreground'>Not Started</div>
                                </div>
                                <div className='text-center'>
                                    <div className='text-lg font-semibold text-purple-600'>{member.studyStreak}</div>
                                    <div className='text-xs text-muted-foreground'>Study Streak</div>
                                </div>
                            </div>

                            <div className='mb-4'>
                                <div className='flex justify-between text-sm mb-1'>
                                    <span>Overall Progress</span>
                                    <span>{member.overallProgress}%</span>
                                </div>
                                <Progress value={member.overallProgress} className='h-2' />
                            </div>

                            <div className='space-y-3'>
                                <h4 className='font-medium text-sm text-muted-foreground'>Deck Progress</h4>
                                {member.deckStatuses.map((deck) => (
                                    <div key={deck.deckId} className='border rounded-lg p-3'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <div className='flex items-center gap-2'>
                                                {getStatusIcon(deck.status)}
                                                <span className='font-medium text-sm'>{deck.deckName}</span>
                                                <Badge
                                                    variant='outline'
                                                    className={`text-xs ${getStatusColor(deck.status)}`}
                                                >
                                                    {deck.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className='text-right'>
                                                <div className='text-sm font-medium'>{deck.progress}%</div>
                                                <div className='text-xs text-muted-foreground'>
                                                    {deck.completedCards}/{deck.totalCards} cards
                                                </div>
                                            </div>
                                        </div>

                                        <div className='mb-2'>
                                            <Progress value={deck.progress} className='h-1' />
                                        </div>

                                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                                            <div className='flex items-center gap-4'>
                                                {deck.lastStudyDate && (
                                                    <span>
                                                        Last studied:{' '}
                                                        {new Date(deck.lastStudyDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {deck.endTime && (
                                                    <span>Due: {new Date(deck.endTime).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                {deck.isOverdue && (
                                                    <div className='flex items-center gap-1 text-red-600'>
                                                        <AlertCircle className='w-3 h-3' />
                                                        <span>Overdue</span>
                                                    </div>
                                                )}
                                                {deck.hoursUntilDeadline !== undefined &&
                                                    deck.hoursUntilDeadline <= 24 && (
                                                        <div className='flex items-center gap-1 text-orange-600'>
                                                            <Clock className='w-3 h-3' />
                                                            <span>{deck.hoursUntilDeadline}h left</span>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {member.lastStudyDate && (
                                <div className='mt-4 pt-4 border-t'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <TrendingUp className='w-4 h-4' />
                                        <span>Last studied: {new Date(member.lastStudyDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
