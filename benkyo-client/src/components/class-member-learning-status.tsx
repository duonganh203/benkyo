import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpenCheck, Target, Activity, Clock } from 'lucide-react';
import { useGetClassMemberLearningStatus } from '@/hooks/queries/use-get-class-member-learning-status';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useClassManagementStore from '@/hooks/stores/use-class-management-store';
import { useNavigate } from 'react-router-dom';
import { getToast } from '@/utils/getToast';

type ClassMemberQuizStats = {
    name: string;
    email: string;
    stats: {
        attempts: number;
        totalCorrect: number;
        totalQuestions: number;
        accuracy: number;
        lastAttempt: string | null;
    };
};

type ClassQuizOverviewResponse = {
    quizCount: number;
    totalAttempts: number;
    activeMembers: number;
    overallAccuracy: number;
    members: ClassMemberQuizStats[];
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
const fmtPct = (x: number) => `${Math.round(clamp01(x) * 100)}%`;

const formatDateTime = (iso?: string | null) => {
    if (!iso) return '—';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t) || t === 0) return '—';
    return new Date(iso).toLocaleString();
};

const initials = (name?: string) => {
    const parts = String(name ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length === 0) return '?';
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (a + b).toUpperCase();
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
                        Class Member Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>No class data available</div>
                </CardContent>
            </Card>
        );
    }

    const { data, isLoading, isError, error } = useGetClassMemberLearningStatus(classData._id) as {
        data?: ClassQuizOverviewResponse;
        isLoading: boolean;
        isError: boolean;
        error?: Error | null;
    };

    if (!user) {
        navigate('/login');
        getToast('error', 'You must be logged in to continue.');
        return null;
    }

    if (isError) {
        getToast('error', `${error?.message ?? 'Something went wrong'}`);
        console.log(error);
        return null;
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        Class Member Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-muted-foreground'>Loading class progress...</div>
                </CardContent>
            </Card>
        );
    }

    if (!data || !data.members || data.members.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        Class Member Progress
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

    const overallAcc = clamp01(data.overallAccuracy);

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Users className='w-5 h-5' />
                        <span>Class Member Progress</span>
                    </div>

                    <Badge variant='outline' className='text-xs'>
                        {data.activeMembers}/{data.members.length} active
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className='space-y-6'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <div className='p-4 bg-muted/30 rounded-lg border'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <BookOpenCheck className='w-4 h-4' />
                            Quiz count
                        </div>
                        <div className='mt-2 text-2xl font-bold text-foreground'>{data.quizCount}</div>
                    </div>

                    <div className='p-4 bg-muted/30 rounded-lg border'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Activity className='w-4 h-4' />
                            Total attempts
                        </div>
                        <div className='mt-2 text-2xl font-bold text-foreground'>{data.totalAttempts}</div>
                    </div>

                    <div className='p-4 bg-muted/30 rounded-lg border'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Users className='w-4 h-4' />
                            Active members
                        </div>
                        <div className='mt-2 text-2xl font-bold text-foreground'>{data.activeMembers}</div>
                    </div>

                    <div className='p-4 bg-muted/30 rounded-lg border'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Target className='w-4 h-4' />
                            Overall accuracy
                        </div>

                        <div className='mt-2 flex items-end justify-between'>
                            <div className='text-2xl font-bold text-foreground'>{fmtPct(overallAcc)}</div>
                            <span className='text-xs text-muted-foreground'>Avg</span>
                        </div>

                        <div className='mt-3'>
                            <Progress value={overallAcc * 100} className='h-2' />
                        </div>
                    </div>
                </div>

                <div className='space-y-4'>
                    {data.members.map((m) => {
                        const acc = clamp01(m.stats?.accuracy ?? 0);
                        const attempts = m.stats?.attempts ?? 0;
                        const totalCorrect = m.stats?.totalCorrect ?? 0;
                        const totalQuestions = m.stats?.totalQuestions ?? 0;
                        const lastAttempt = m.stats?.lastAttempt ?? null;

                        return (
                            <div
                                key={m.email}
                                className='p-4 bg-muted/30 rounded-lg border transition hover:bg-muted/40'
                            >
                                <div className='flex items-start justify-between gap-4'>
                                    <div className='flex items-center gap-4 flex-1 min-w-0'>
                                        <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold'>
                                            {initials(m.name)}
                                        </div>

                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2'>
                                                <div className='font-medium text-foreground truncate'>{m.name}</div>
                                                <Badge
                                                    variant={attempts > 0 ? 'outline' : 'secondary'}
                                                    className='text-xs'
                                                >
                                                    {attempts > 0 ? 'Active' : 'No attempts'}
                                                </Badge>
                                            </div>

                                            <div className='text-sm text-muted-foreground truncate'>{m.email}</div>

                                            <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                                                <Clock className='w-3 h-3' />
                                                <span>Last attempt: {formatDateTime(lastAttempt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='text-right shrink-0'>
                                        <div className='text-xl font-bold text-primary'>{fmtPct(acc)}</div>
                                        <div className='text-xs text-muted-foreground'>Accuracy</div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-3 gap-3 mt-4'>
                                    <div className='p-3 bg-background/60 rounded-md border'>
                                        <div className='text-lg font-semibold text-foreground'>{attempts}</div>
                                        <div className='text-[11px] text-muted-foreground'>Attempts</div>
                                    </div>
                                    <div className='p-3 bg-background/60 rounded-md border'>
                                        <div className='text-lg font-semibold text-foreground'>{totalCorrect}</div>
                                        <div className='text-[11px] text-muted-foreground'>Correct</div>
                                    </div>
                                    <div className='p-3 bg-background/60 rounded-md border'>
                                        <div className='text-lg font-semibold text-foreground'>{totalQuestions}</div>
                                        <div className='text-[11px] text-muted-foreground'>Questions</div>
                                    </div>
                                </div>

                                <div className='mt-4'>
                                    <div className='flex justify-between text-xs text-muted-foreground mb-1'>
                                        <span>Accuracy</span>
                                        <span className='text-foreground font-medium'>
                                            {totalCorrect}/{totalQuestions}
                                        </span>
                                    </div>
                                    <Progress value={acc * 100} className='h-2' />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
