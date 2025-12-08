import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users, BookOpen, TrendingUp } from 'lucide-react';

export interface ClassHeaderProps {
    classData: {
        _id: string;
        name: string;
        description: string;
        bannerUrl?: string;
        visibility: 'public' | 'private';
        requiredApprovalToJoin: boolean;
        classCode?: string;
        category?: string;
        completionRate: number;
    };
    isExpanded: boolean;
    onToggleExpanded: () => void;
    totalLearnersCount: number;
    totalDecksCount: number;
}

const ClassHeader = ({
    classData,
    isExpanded,
    onToggleExpanded,
    totalLearnersCount,
    totalDecksCount
}: ClassHeaderProps) => {
    return (
        <Card
            className={`relative overflow-hidden transition-all duration-500 ease-out ${
                isExpanded ? 'h-auto' : 'h-[200px]'
            }`}
            style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${classData.bannerUrl || '/default-class-banner.svg'}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className='absolute inset-0 bg-background/40 backdrop-blur-sm' />
            <div className='relative z-10 p-8 text-white h-full flex flex-col'>
                <div className='flex justify-between items-start'>
                    <div className='animate-fade-in-up'>
                        <h1 className='text-4xl font-bold mb-2'>{classData.name}</h1>
                        <p className='text-lg opacity-90'>{classData.description}</p>
                    </div>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={onToggleExpanded}
                        className='bg-background/40 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110 text-white cursor-pointer'
                    >
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </Button>
                </div>

                <div className='flex space-x-6 mt-6'>
                    <div className='flex items-center space-x-2'>
                        <Users className='h-5 w-5' />
                        <span>{totalLearnersCount} learners</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <BookOpen className='h-5 w-5' />
                        <span>{totalDecksCount} decks</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <TrendingUp className='h-5 w-5' />
                        <span>{classData.completionRate}% completion</span>
                    </div>
                </div>

                {isExpanded && (
                    <div className='mt-8 animate-fade-in-up flex-1 overflow-hidden'>
                        <div className='grid md:grid-cols-2 gap-8 h-full'>
                            <div>
                                <h3 className='text-xl font-semibold mb-4'>Class Description</h3>
                                <p className='text-white/90 leading-relaxed'>{classData.description}</p>
                                <div className='mt-4 text-sm space-y-1'>
                                    <p>
                                        <strong>Category:</strong> {classData.category}
                                    </p>
                                    <p>
                                        <strong>Visibility:</strong> {classData.visibility}
                                    </p>
                                    {classData.visibility === 'private' && (
                                        <p>
                                            <strong>Approval required:</strong>{' '}
                                            {classData.requiredApprovalToJoin ? 'Yes' : 'No'}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Class Code:</strong> {classData.classCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ClassHeader;
