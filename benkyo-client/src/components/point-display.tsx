import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Unlock } from 'lucide-react';

interface PointsDisplayProps {
    totalPoints: number;
    pointsToNextUnlock?: number;
    nextUnlockTitle?: string;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ totalPoints, pointsToNextUnlock, nextUnlockTitle }) => {
    return (
        <Card className='bg-gradient-subtle border-primary/20'>
            <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                            <Trophy className='w-5 h-5 text-primary' />
                        </div>
                        <div>
                            <p className='font-semibold text-foreground'>Total Points</p>
                            <p className='text-2xl font-bold text-primary'>{totalPoints}</p>
                        </div>
                    </div>

                    {pointsToNextUnlock !== undefined && nextUnlockTitle && (
                        <div className='text-right'>
                            <div className='flex items-center gap-2 mb-1'>
                                <Target className='w-4 h-4 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>Next unlock</span>
                            </div>
                            <Badge variant='outline' className='mb-1'>
                                <Unlock className='w-3 h-3 mr-1' />
                                {nextUnlockTitle}
                            </Badge>
                            <p className='text-sm font-semibold text-primary'>
                                {pointsToNextUnlock} more points needed
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PointsDisplay;
