import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getToast } from '@/utils/getToast';
import { ClassListItemUserResponseDto } from '@/types/class';
import useRequestJoinClass from '@/hooks/queries/use-request-join-class';

const ClassCard = ({
    classItem,
    index,
    variant
}: {
    classItem: ClassListItemUserResponseDto;
    index: number;
    variant: 'my-class' | 'suggested';
}) => {
    const { mutateAsync: requestJoin } = useRequestJoinClass();
    const navigate = useNavigate();

    const handleJoinClass = async () => {
        const response = await requestJoin({ classId: classItem._id });
        if (response.message === 'Joined class successfully') {
            getToast('success', response.message);
            navigate(`/class/${classItem._id}`);
        } else if (response.message === 'Join request sent successfully') {
            getToast('success', response.message);
        } else {
            getToast('error', response.message);
        }
    };

    return (
        <Card
            className='h-[300px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up'
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div
                className='relative h-32 bg-cover bg-center'
                style={{
                    backgroundImage: `url(${classItem.bannerUrl || '/default-class-banner.svg'})`
                }}
            ></div>
            <div className='flex-1 p-4 flex flex-col justify-between bg-background/40 backdrop-blur-sm'>
                <div>
                    <div className='bottom-0 left-0 right-0'>
                        <h3 className='text-white text-base font-bold truncate'>{classItem.name}</h3>
                        <p className='text-sm text-gray-200 line-clamp-2'>{classItem.description}</p>
                    </div>
                    <div className='flex items-center text-xs text-gray-500 mt-4'>
                        <Calendar className='h-3 w-3 mr-1.5' />
                        Last active:{' '}
                        {formatDistanceToNow(new Date(classItem.createdAt), {
                            addSuffix: true,
                            locale: enUS
                        })}
                    </div>
                </div>
                <div className='mt-4'>
                    {variant === 'my-class' ? (
                        <Button className='w-full cursor-pointer'>
                            Enter Class
                            <ArrowRight className='h-4 w-4 ml-2' />
                        </Button>
                    ) : (
                        <Button
                            variant='secondary'
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleJoinClass();
                            }}
                            className='w-full cursor-pointer'
                        >
                            Join
                            <UserPlus className='h-4 w-4 ml-2' />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ClassCard;
