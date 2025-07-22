import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { AvatarImage } from '@radix-ui/react-avatar';

export interface TopLearner {
    id: string;
    name: string;
    avatar: string;
    points: number;
    streak: number;
}

export interface TopLearnersProps {
    topLearners: TopLearner[];
}

const TopLearners = ({ topLearners }: TopLearnersProps) => {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className='h-5 w-5 text-yellow-500' />;
            case 2:
                return <Medal className='h-5 w-5 text-gray-400' />;
            case 3:
                return <Award className='h-5 w-5 text-orange-500' />;
            default:
                return <span className='text-lg font-bold text-muted-foreground'>#{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500';
            case 3:
                return 'bg-gradient-to-r from-orange-400 to-orange-600';
            default:
                return 'bg-gradient-to-r from-blue-400 to-blue-600';
        }
    };

    return (
        <Card className='p-6 h-fit'>
            <div className='flex items-center space-x-2 mb-6'>
                <Trophy className='h-6 w-6 text-orange-600' />
                <h2 className='text-xl font-bold'>Top Diligent Learners</h2>
            </div>

            {topLearners && topLearners.length > 0 ? (
                <div className='space-y-4'>
                    {topLearners.map((learner, index) => (
                        <div
                            key={learner.id}
                            className='flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105 animate-fade-in-up'
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className='relative'>
                                <Avatar
                                    className={`h-12 w-12 rounded-full flex items-center justify-center ${getRankColor(index + 1)}`}
                                >
                                    <Avatar>
                                        <AvatarImage
                                            src={learner.avatar}
                                            alt={learner.name ? `${learner.name}'s avatar` : 'Learner Avatar'}
                                        />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Avatar>
                                <div className='absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg'>
                                    {getRankIcon(index + 1)}
                                </div>
                            </div>

                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='font-semibold text-sm truncate'>{learner.name}</h3>
                                    <Badge variant='outline' className='text-xs'>
                                        Learner
                                    </Badge>
                                </div>
                                <div className='flex items-center justify-between mt-1'>
                                    <p className='text-sm text-muted-foreground'>
                                        {learner.points.toLocaleString()} points
                                    </p>
                                    <p className='text-xs text-green-600'>🔥 {learner.streak} days</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-center text-gray-500'>No top learners yet for this class.</p>
            )}

            <div className='mt-6 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg'>
                <p className='text-sm text-center text-muted-foreground'>
                    💡 <strong>Tip:</strong> Study consistently every day to reach the top!
                </p>
            </div>
        </Card>
    );
};

export default TopLearners;
