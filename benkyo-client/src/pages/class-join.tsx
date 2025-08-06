import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getToast } from '@/utils/getToast';
import useRequestJoinClass from '@/hooks/queries/use-request-join-class';

const ClassJoin = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [result, setResult] = useState<'success' | 'error' | null>(null);
    const [message, setMessage] = useState('');

    const { mutateAsync: requestJoinMutation } = useRequestJoinClass();

    useEffect(() => {
        const handleJoinClass = async () => {
            if (!classId) {
                setResult('error');
                setMessage('Invalid class ID');
                setIsProcessing(false);
                return;
            }

            requestJoinMutation(
                { classId },
                {
                    onSuccess: () => {
                        getToast('success', `Request Join Class Successfully`);
                    },
                    onError: (error) => {
                        getToast('error', `${error.message}`);
                        console.log(error);
                    }
                }
            );
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
                    ) : result === 'success' ? (
                        <div className='text-center space-y-4'>
                            <CheckCircle className='w-12 h-12 mx-auto text-green-500' />
                            <div className='space-y-2'>
                                <p className='text-lg font-medium text-green-600'>{message}</p>
                                <p className='text-sm text-muted-foreground'>
                                    You can now access the class and start learning!
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
                    ) : (
                        <div className='text-center space-y-4'>
                            <XCircle className='w-12 h-12 mx-auto text-red-500' />
                            <div className='space-y-2'>
                                <p className='text-lg font-medium text-red-600'>Join Failed</p>
                                <p className='text-sm text-muted-foreground'>{message}</p>
                            </div>
                            <Button onClick={handleGoToClassList} className='w-full'>
                                Back to Class List
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ClassJoin;
