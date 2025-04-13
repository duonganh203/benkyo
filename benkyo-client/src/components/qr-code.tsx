import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import { getToast } from '@/utils/getToast';
import useGetQRInfo from '@/hooks/queries/use-get-qr-info';
import { Skeleton } from './ui/skeleton';
import useCheckIsPaid from '@/hooks/queries/use-check-paid';
import { useNavigate } from 'react-router-dom';

const bankId = import.meta.env.VITE_PAYMENT_BANK_ID;
const accountNo = import.meta.env.VITE_PAYMENT_BANK_ACCOUNT_NO;

const PaymentQRCode = ({ packageId }: { packageId: string }) => {
    const navigate = useNavigate();
    const { data: qrInfo, isLoading, refetch: getQRAgain } = useGetQRInfo(packageId!);
    const { refetch: checkIsPaid } = useCheckIsPaid(qrInfo?._id ?? '');
    const [qrCode, setQrCode] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isExpired, setIsExpired] = useState<boolean>(false);

    const userId = qrInfo?.user._id;
    const packageInfo = qrInfo?.package;
    const expiredAt = qrInfo ? new Date(qrInfo.expiredAt) : new Date();

    const initialDuration = useMemo(() => {
        return qrInfo ? Math.floor((expiredAt.getTime() - Date.now()) / 1000) : 0;
    }, [qrInfo, expiredAt]);

    const generateQRCodeURL = () =>
        `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.jpg?amount=${packageInfo?.price}&addInfo=${userId} ${packageInfo?.type}`;

    const handleGenerateQRCode = async () => {
        getQRAgain();
        getToast('info', 'QR Code Generated. Scan within 30 minutes to complete payment');
    };

    useEffect(() => {
        if (qrInfo) {
            setQrCode(generateQRCodeURL());
            setTimeLeft(initialDuration);
            setIsExpired(false);
        }
    }, [qrInfo, initialDuration]);
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        if (timeLeft % 5 == 0) {
            checkIsPaid().then(({ data }) => {
                if (data?.isPaid) {
                    getToast('success', 'Payment completed successfully!');
                    navigate('/home');
                }
            });
        }

        const timerId = setTimeout(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timerId);
    }, [timeLeft]);

    const isLowTime = timeLeft <= 30;
    const isMediumTime = timeLeft <= 60 && !isLowTime;

    return (
        <Card className='max-w-lg mx-auto p-8 shadow-lg'>
            <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-primary mb-2'>Payment QR Code</h2>
                <p className='text-muted-foreground'>Scan the QR code below to complete your payment</p>
            </div>

            <div className='flex flex-col items-center mb-6'>
                <div className='circular-progress mb-4 relative'>
                    <svg width='300' height='300' viewBox='0 0 100 100'>
                        <circle className='progress-bg' cx='50' cy='50' r='45' strokeDasharray={2 * Math.PI * 45} />
                        <circle
                            className='progress'
                            cx='50'
                            cy='50'
                            r='45'
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={
                                isExpired || !initialDuration || !timeLeft
                                    ? 0
                                    : 2 * Math.PI * 45 * (1 - timeLeft / initialDuration)
                            }
                            style={{
                                stroke: isExpired
                                    ? 'var(--destructive)'
                                    : isLowTime
                                      ? 'var(--warning)'
                                      : isMediumTime
                                        ? 'var(--warning)'
                                        : 'var(--sidebar-ring)'
                            }}
                        />
                    </svg>

                    <div className='qr-container flex items-center justify-center absolute inset-0'>
                        {isLoading || !qrInfo ? (
                            <Skeleton className='w-[180px] h-[180px] rounded-md' />
                        ) : qrCode && !isExpired ? (
                            <img src={qrCode} alt='Payment QR Code' className={isLowTime ? 'pulse-animation' : ''} />
                        ) : (
                            <div className='flex items-center justify-center w-[180px] h-[180px] bg-secondary'>
                                <span className='text-muted-foreground text-sm'>QR Code Expired</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex items-center justify-center gap-2 mb-2'>
                    <Clock
                        size={20}
                        className={isExpired ? 'text-destructive' : isLowTime ? 'text-warning' : 'text-primary'}
                    />
                    <span
                        className={`text-xl font-mono font-bold ${
                            isExpired ? 'text-destructive' : isLowTime ? 'text-warning' : 'text-primary'
                        }`}
                    >
                        {`${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
                    </span>
                </div>

                {isExpired && (
                    <Button onClick={handleGenerateQRCode} className='mt-2' size='sm' variant='outline'>
                        <RefreshCw size={16} className='mr-2' />
                        Generate New Code
                    </Button>
                )}
            </div>

            <div className='bg-muted p-4 rounded-md mb-6'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                    <span className='text-muted-foreground'>User ID:</span>
                    <span className='font-medium'>{userId}</span>
                    <span className='text-muted-foreground'>Package:</span>
                    <span className='font-medium'>
                        <Badge variant='outline' className='px-[50px] w-5 h-5'>
                            {packageInfo?.type}
                        </Badge>
                    </span>
                    <span className='text-muted-foreground'>Price:</span>
                    <span className='font-medium'>${packageInfo?.price.toFixed(2)}</span>
                    <span className='text-muted-foreground'>Expires:</span>
                    <span className='font-medium'>{expiredAt.toLocaleTimeString()}</span>
                </div>
            </div>

            <div className='text-center text-xs text-muted-foreground'>
                <p>This QR code will expire in 30 minutes for security purposes</p>
            </div>
        </Card>
    );
};

export default PaymentQRCode;
