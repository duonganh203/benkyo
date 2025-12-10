import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getToast } from '@/utils/getToast';
import useCreateWalletTopup from '@/hooks/queries/use-get-wallet-topup';
import useMe from '@/hooks/queries/use-me';
import useCheckIsPaid from '@/hooks/queries/use-check-paid';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { useQueryClient } from '@tanstack/react-query';

const bankId = import.meta.env.VITE_PAYMENT_BANK_ID;
const accountNo = import.meta.env.VITE_PAYMENT_BANK_ACCOUNT_NO;
const presetAmounts = [10000, 20000, 50000, 100000, 500000];
const STEP = 1000;
const MIN = 1000;
const type = 'topup';

const WalletTopup = () => {
    const { data: currentUser } = useMe();
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();
    const [amount, setAmount] = useState(presetAmounts[0]);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [topupId, setTopupId] = useState<string | null>(null);
    const [pendingAmount, setPendingAmount] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
    const [isExpired, setIsExpired] = useState<boolean>(false);

    const { mutate: createTopup, isPending } = useCreateWalletTopup();
    const { refetch: checkIsPaid } = useCheckIsPaid(topupId ?? '');

    const buildVietQRUrl = (value: number) => {
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.jpg?amount=${value}&addInfo=${currentUser?._id} ${type}`;
    };

    const triggerTopup = (value: number) => {
        if (value < MIN || value % STEP !== 0) {
            getToast('error', 'Amount must be at least 1,000 VND and divisible by 1,000.');
            return;
        }

        setQrUrl(null);
        setTopupId(null);
        setIsExpired(false);
        setTimeLeft(0);

        createTopup(value, {
            onSuccess: (data) => {
                setTopupId(data._id);
                setPendingAmount(value);
                setQrUrl(buildVietQRUrl(value));
                setIsExpired(false);
                setTimeLeft(30 * 60);
            },
            onError: () => {
                getToast('error', 'Failed to create top-up transaction. Please try again.');
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerTopup(amount);
    };

    useEffect(() => {
        if (!qrUrl || isExpired || timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    clearInterval(timerId);
                    setIsExpired(true);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [qrUrl, isExpired, timeLeft]);

    useEffect(() => {
        if (!topupId || isExpired) return;

        const intervalId = setInterval(() => {
            checkIsPaid().then(({ data }) => {
                if (data?.isPaid) {
                    const inc = pendingAmount ?? amount;
                    if (user) {
                        setUser({ ...user, balance: (user.balance || 0) + inc });
                    }
                    queryClient.invalidateQueries({ queryKey: ['me'] });
                    getToast(
                        'success',
                        'Top-up successful!',
                        `Your balance has been updated by +${inc.toLocaleString('vi-VN')} đ`
                    );
                    setTopupId(null);
                    setPendingAmount(null);
                    setQrUrl(null);
                    setIsExpired(false);
                    setTimeLeft(0);
                    clearInterval(intervalId);
                }
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [topupId, isExpired]);

    return (
        <div className='min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-6'>
            <div className='w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8'>
                <div className='mb-4 space-y-2 text-center'>
                    <h1 className='text-2xl font-semibold tracking-tight'>Top up your wallet</h1>
                    <p className='text-sm text-muted-foreground'>
                        Choose a preset amount or enter a custom value (VND). Amount must be divisible by 1,000.
                    </p>
                </div>

                <div className='mb-4 flex flex-wrap justify-center gap-2'>
                    {presetAmounts.map((v) => (
                        <Button
                            key={v}
                            type='button'
                            variant={v === amount ? 'default' : 'outline'}
                            size='sm'
                            className='rounded-full px-4'
                            onClick={() => {
                                setAmount(v);
                                triggerTopup(v);
                            }}
                        >
                            {v.toLocaleString('vi-VN')} đ
                        </Button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-1.5'>
                        <label className='text-sm font-medium'>Other amount (VND)</label>

                        <div className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={() => setAmount((prev) => Math.max(1000, prev - 1000))}
                                className='h-10 w-10 flex items-center justify-center rounded-lg border bg-muted hover:bg-muted/70 text-lg'
                            >
                                –
                            </button>

                            <input
                                type='text'
                                value={amount.toLocaleString('vi-VN')}
                                onChange={(e) => {
                                    const raw = Number(e.target.value.replace(/\D/g, '')) || 0;
                                    setAmount(raw);
                                }}
                                className='w-full text-center rounded-lg border bg-background px-3 py-2 text-lg font-semibold focus:outline-none no-spinner'
                            />

                            <button
                                type='button'
                                onClick={() => setAmount((prev) => prev + 1000)}
                                className='h-10 w-10 flex items-center justify-center rounded-lg border bg-muted hover:bg-muted/70 text-lg'
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <Button disabled={isPending} type='submit' className='w-full'>
                        {isPending ? 'Creating transaction...' : 'Generate QR code'}
                    </Button>
                </form>

                <div className='mt-5 space-y-3'>
                    {isPending && (
                        <div className='rounded-lg border bg-muted/40 px-3 py-2 text-center text-sm text-muted-foreground'>
                            Generating QR for <span className='font-semibold'>{amount.toLocaleString('vi-VN')} đ</span>
                            ...
                        </div>
                    )}

                    {qrUrl && (
                        <div className='mt-2 flex flex-col items-center gap-3 rounded-xl border bg-muted/30 p-4'>
                            <p className='text-sm font-medium'>Scan this QR code to complete your top-up</p>
                            <img
                                src={qrUrl}
                                alt='Wallet top-up QR'
                                className='h-56 w-56 rounded-lg border bg-background/40 backdrop-blur-sm object-contain p-2'
                            />

                            <p className='text-xs text-muted-foreground'>
                                Amount: <span className='font-semibold'>{amount.toLocaleString('vi-VN')} đ</span>
                            </p>

                            {isExpired && (
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        triggerTopup(amount);
                                        getToast('info', 'QR regenerated. Please scan within 30 minutes');
                                    }}
                                >
                                    Regenerate QR
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletTopup;
