import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { getToast } from '@/utils/getToast';
import useGetQRInfo from '@/hooks/queries/use-get-qr-info';
import useCheckIsPaid from '@/hooks/queries/use-check-paid';
import useAuthStore from '@/hooks/stores/use-auth-store';

const bankId = import.meta.env.VITE_PAYMENT_BANK_ID;
const accountNo = import.meta.env.VITE_PAYMENT_BANK_ACCOUNT_NO;

const PaymentQRCode = ({ packageId }: { packageId: string }) => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const { data: qrInfo, isLoading, refetch: getQRAgain } = useGetQRInfo(packageId);
    const { refetch: checkIsPaid } = useCheckIsPaid(qrInfo?._id ?? '');

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);

    const expiredAt = useMemo(() => (qrInfo ? new Date(qrInfo.expiredAt) : null), [qrInfo]);
    const qrCode = useMemo(() => {
        if (!qrInfo) return '';
        const { user, package: pkg } = qrInfo;
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.jpg?amount=${pkg?.price}&addInfo=${user._id} ${pkg?.type}`;
    }, [qrInfo]);

    useEffect(() => {
        if (expiredAt) {
            const secondsLeft = Math.floor((expiredAt.getTime() - Date.now()) / 1000);
            setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
        }
    }, [expiredAt]);

    useEffect(() => {
        if (!timeLeft || isExpired) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    setIsExpired(true);
                    clearInterval(timerId);
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, isExpired]);

    useEffect(() => {
        if (timeLeft > 0 && timeLeft % 5 === 0) {
            checkIsPaid().then(({ data }) => {
                if (data?.isPaid) {
                    if (user) {
                        setUser({ ...user, isPro: true });
                    }
                    getToast('success', 'Payment completed successfully!');
                    navigate('/home');
                }
            });
        }
    }, [timeLeft]);

    const handleGenerateQRCode = () => {
        getQRAgain();
        setIsExpired(false);
        getToast('info', 'QR Code regenerated. Scan within 30 minutes to complete payment');
    };

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    const userName = qrInfo?.user?.name;
    const packageInfo = qrInfo?.package;

    return (
        <Card className='max-w-lg mx-auto p-8 shadow-lg'>
            <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-primary mb-2'>Payment QR Code</h2>
                <p className='text-muted-foreground'>Scan the QR code below to complete your payment</p>
            </div>

            <div className='flex flex-col items-center mb-6'>
                <div className='circular-progress mb-4 relative'>
                    <svg width='300' height='300' viewBox='0 0 100 100'></svg>
                    <div className='flex items-center justify-center absolute inset-0'>
                        {isLoading ? (
                            <Skeleton className='w-[180px] h-[180px] rounded-md' />
                        ) : !isExpired && qrCode ? (
                            <div className='qr-container relative'>
                                <img src={qrCode} alt='Payment QR Code' width={250} height={250} />
                                <div className='corner-border top-left'></div>
                                <div className='corner-border top-right'></div>
                                <div className='corner-border bottom-left'></div>
                                <div className='corner-border bottom-right'></div>
                            </div>
                        ) : (
                            <div className='flex items-center justify-center w-[180px] h-[180px] bg-secondary'>
                                <span className='text-muted-foreground text-sm'>QR Code Expired</span>
                            </div>
                        )}
                    </div>
                </div>

                <span className='text-xl font-mono font-bold'>{`${minutes}:${seconds}`}</span>

                {isExpired && (
                    <Button onClick={handleGenerateQRCode} className='mt-2' size='sm' variant='outline'>
                        <RefreshCw size={16} className='mr-2' />
                        Generate New Code
                    </Button>
                )}
            </div>

            <div className='bg-muted py-10 px-16 rounded-md mb-6'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                    <span className='text-muted-foreground'>User Name:</span>
                    <span className='font-medium'>{userName}</span>
                    <span className='text-muted-foreground'>Package:</span>
                    <span className='font-medium'>{packageInfo?.type}</span>
                    <span className='text-muted-foreground'>Price:</span>
                    <span className='font-medium'>{packageInfo?.price} VND</span>
                    <span className='text-muted-foreground'>Expires:</span>
                    <span className='font-medium'>{expiredAt?.toLocaleString('vi-VN')}</span>
                </div>
            </div>

            <div className='text-center text-xs text-muted-foreground'>
                <p>This QR code will expire in 30 minutes for security purposes</p>
            </div>
        </Card>
    );
};

export default PaymentQRCode;
