import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, PlayCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressCardProps {
    title: string;
    description: string;
    progress?: number;
    status: 'completed' | 'locked' | 'available' | 'in-progress' | 'paid';
    onClick?: () => void;
    onEnroll?: () => void;
    isEnrolled?: boolean;
    testScore?: number;
    isOwner?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
    title,
    description,
    progress,
    status,
    onClick,
    onEnroll,
    isEnrolled,
    testScore,
    isOwner
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return <CheckCircle className='w-5 h-5 text-success' />;
            case 'locked':
                return <Lock className='w-5 h-5 text-muted-foreground' />;
            case 'in-progress':
                return <PlayCircle className='w-5 h-5 text-warning' />;
            case 'paid':
                return <CreditCard className='w-5 h-5 text-green-500' />;
            default:
                return <PlayCircle className='w-5 h-5 text-primary' />;
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'completed':
                return <Badge className='bg-success text-success-foreground'>Completed</Badge>;
            case 'locked':
                return <Badge variant='secondary'>Locked</Badge>;
            case 'in-progress':
                return <Badge className='bg-warning text-warning-foreground'>In Progress</Badge>;
            case 'paid':
                return <Badge className='bg-green-500 text-white'>Paid</Badge>;
            default:
                return <Badge variant='outline'>Available</Badge>;
        }
    };

    const isClickable = isOwner || status === 'available' || status === 'in-progress' || status === 'paid';

    return (
        <Card
            className={`transition-transform duration-300 ease-out hover:shadow-elevated ${
                isClickable ? 'cursor-pointer hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={isClickable ? onClick : undefined}
        >
            <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                        {getStatusIcon()}
                        <CardTitle className='text-lg'>{title}</CardTitle>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>

            <CardContent>
                <p className='text-muted-foreground mb-4'>{description}</p>

                {progress !== undefined && (
                    <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className='w-full bg-muted rounded-full h-2'>
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    status === 'completed'
                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {!isOwner && !isEnrolled && status === 'available' && onEnroll && (
                    <Button size='sm' variant='outline' className='mt-3 w-full' onClick={onEnroll}>
                        Enroll
                    </Button>
                )}

                {testScore !== undefined && (
                    <div className='mt-3 p-2 bg-accent rounded-md'>
                        <span className='text-sm text-accent-foreground'>
                            Test Score: <span className='font-semibold'>{testScore}%</span>
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProgressCard;
