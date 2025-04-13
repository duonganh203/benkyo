import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getToast } from '@/utils/getToast';
import useGetQRInfo from '@/hooks/queries/use-get-qr-info';
import useCheckIsPaid from '@/hooks/queries/use-check-paid';
import { Skeleton } from './ui/skeleton';
import { useNavigate } from 'react-router-dom';

const bankId = import.meta.env.VITE_PAYMENT_BANK_ID;
const accountNo = import.meta.env.VITE_PAYMENT_BANK_ACCOUNT_NO;

const PaymentQRCode = ({ packageId }: { packageId: string }) => {
    const navigate = useNavigate();
    const { data: qrInfo, isLoading, refetch: getQRAgain } = useGetQRInfo(packageId);
    const { refetch: checkIsPaid } = useCheckIsPaid(qrInfo?._id ?? '');

    const [timeLeft, setTimeLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);

    const userId = qrInfo?.user._id;
    const userName = qrInfo?.user.name;
    const packageInfo = qrInfo?.package;
    const expiredAt = useMemo(() => (qrInfo ? new Date(qrInfo.expiredAt) : new Date()), [qrInfo]);

    const qrCode = useMemo(() => {
        if (!qrInfo) return '';
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.jpg?amount=${packageInfo?.price}&addInfo=${userId} ${packageInfo?.type}`;
    }, [qrInfo, userId, packageInfo]);

    const handleGenerateQRCode = () => {
        getQRAgain();
        getToast('info', 'QR Code Generated. Scan within 30 minutes to complete payment');
    };

    useEffect(() => {
        if (!qrInfo) return;
        setIsExpired(false);
        setTimeLeft(Math.floor((new Date(qrInfo.expiredAt).getTime() - Date.now()) / 1000));
    }, [qrInfo]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        const timerId = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);

        if (timeLeft % 5 === 0) {
            checkIsPaid().then(({ data }) => {
                if (data?.isPaid) {
                    getToast('success', 'Payment completed successfully!');
                    navigate('/home');
                }
            });
        }

        return () => clearTimeout(timerId);
    }, [timeLeft, checkIsPaid, navigate]);

    if (!qrInfo) {
        getToast('error', 'QR Code not found!');
        navigate('/home');
        return null;
    }

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

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
                    <span className='font-medium'>{expiredAt.toLocaleString('vi-VN')}</span>
                </div>
            </div>

            <div className='text-center text-xs text-muted-foreground'>
                <p>This QR code will expire in 30 minutes for security purposes</p>
            </div>
        </Card>
    );
};

export default PaymentQRCode;
