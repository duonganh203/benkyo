import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import useRequestJoinClass from '@/hooks/queries/use-request-join-class';

const ClassJoin = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    const { mutateAsync: requestJoinMutation } = useRequestJoinClass();

    useEffect(() => {
        const handleJoinClass = async () => {
            if (!classId) {
                setIsProcessing(false);
                return;
            }

            await requestJoinMutation({ classId });
            setIsProcessing(false);
        };

        handleJoinClass();
    }, [classId]);

    const handleGoToClassList = () => {
        navigate('/class/list');
    };

    const handleGoToClass = () => {
        navigate(`/class/${classId}`);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl font-bold'>Join Class</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {isProcessing ? (
                        <div className='text-center space-y-4'>
                            <Loader2 className='w-12 h-12 mx-auto animate-spin text-primary' />
                            <p className='text-muted-foreground'>Processing your join request...</p>
                        </div>
                    ) : (
                        <div className='text-center space-y-4'>
                            <div className='space-y-2'>
                                <p className='text-lg font-medium'>Request processed</p>
                                <p className='text-sm text-muted-foreground'>
                                    If you weren't redirected, you can go to the class or back to the class list.
                                </p>
                            </div>
                            <div className='flex gap-3 pt-4'>
                                <Button onClick={handleGoToClass} className='flex-1'>
                                    Go to Class
                                </Button>
                                <Button onClick={handleGoToClassList} variant='outline' className='flex-1'>
                                    Class List
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClassJoin;
