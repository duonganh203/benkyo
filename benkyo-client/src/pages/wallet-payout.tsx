import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToast } from '@/utils/getToast';
import useCreatePayout from '@/hooks/queries/use-create-payout';
import useTransactions from '@/hooks/queries/use-transactions';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TransactionItem } from '@/types/payment';

const MIN_PAYOUT = 10000;
const STEP = 1000;

const BANKS = [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'MB', name: 'MBBank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'VIB', name: 'VIB' },
    { code: 'EIB', name: 'Eximbank' },
    { code: 'SHB', name: 'SHB' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'HDB', name: 'HDBank' },
    { code: 'STB', name: 'Sacombank' }
];

const maskAccount = (value?: string) => {
    if (!value) return '';
    if (value.length <= 4) return value;
    return value.replace(/.(?=.{4})/g, '*');
};

const currencyDisplay = (v?: number) => (v || v === 0 ? v.toLocaleString('vi-VN') + ' đ' : '--');

const statusTone: Record<string, string> = {
    PENDING: 'secondary',
    PAID: 'default',
    SUCCESS: 'default',
    REJECTED: 'destructive',
    FAILED: 'destructive',
    CANCELED: 'outline',
    EXPIRED: 'outline'
};

const WalletPayout = () => {
    const { user, setUser } = useAuthStore();
    const queryClient = useQueryClient();

    const [amount, setAmount] = useState<number>(MIN_PAYOUT);
    const [bankCode, setBankCode] = useState('VCB');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [note, setNote] = useState('');

    const { mutate: submitPayout, isPending } = useCreatePayout();
    const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();

    const payoutHistory = useMemo(() => {
        return (transactions || []).filter((tx) => tx.type === 'PAYOUT');
    }, [transactions]);

    const allTransactions = useMemo(() => {
        return (transactions || []).sort((a, b) => {
            const dateA = new Date(a.createdAt || a.when || 0).getTime();
            const dateB = new Date(b.createdAt || b.when || 0).getTime();
            return dateB - dateA;
        });
    }, [transactions]);

    const pendingAmount = useMemo(() => {
        return payoutHistory.filter((tx) => tx.status === 'PENDING').reduce((acc, tx) => acc + (tx.amount || 0), 0);
    }, [payoutHistory]);

    const available = useMemo(() => {
        const totalBalance = user?.balance || 0;
        return totalBalance - pendingAmount;
    }, [user?.balance, pendingAmount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount < MIN_PAYOUT || amount % STEP !== 0) {
            getToast(
                'error',
                `Minimum amount is ${MIN_PAYOUT.toLocaleString('vi-VN')} and must be a multiple of ${STEP}.`
            );
            return;
        }
        if (amount > available) {
            getToast('error', 'Insufficient balance after pending requests.');
            return;
        }
        submitPayout(
            {
                amount,
                bankAbbreviation: bankCode,
                accountNumber,
                accountName,
                note,
                paymentMethod: 'BANK_TRANSFER'
            },
            {
                onSuccess: () => {
                    getToast('success', 'Payout request created successfully');
                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                    queryClient.invalidateQueries({ queryKey: ['me'] });
                    if (user) {
                        setUser({ ...user, balance: user.balance || 0 });
                    }
                },
                onError: (err) => {
                    getToast('error', err.response?.data?.message || 'Failed to submit request');
                }
            }
        );
    };

    return (
        <div className='min-h-[calc(100vh-80px)] px-4 py-6 flex flex-col gap-6 lg:flex-row'>
            <Card className='w-full lg:w-2/5 max-w-xl'>
                <CardHeader>
                    <CardTitle>Payout Request</CardTitle>
                    <p className='text-sm text-muted-foreground'>Enter your bank account information.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='text-sm font-medium'>Amount (VND)</label>
                            <div className='mt-2 flex items-center gap-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => setAmount((v) => Math.max(MIN_PAYOUT, v - STEP))}
                                    className='h-10 w-10'
                                >
                                    –
                                </Button>
                                <Input
                                    value={amount.toLocaleString('vi-VN')}
                                    onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, '')) || 0)}
                                    className='text-right font-semibold'
                                />
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => setAmount((v) => v + STEP)}
                                    className='h-10 w-10'
                                >
                                    +
                                </Button>
                            </div>
                            <p className='mt-1 text-xs text-muted-foreground'>
                                Available balance: {currencyDisplay(available)}
                            </p>
                            {pendingAmount > 0 && (
                                <p className='text-xs text-muted-foreground'>
                                    Pending: {currencyDisplay(pendingAmount)}
                                </p>
                            )}
                        </div>

                        <div className='grid gap-3 sm:grid-cols-2'>
                            <div>
                                <label className='text-sm font-medium'>Bank</label>
                                <select
                                    value={bankCode}
                                    onChange={(e) => setBankCode(e.target.value)}
                                    className='w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
                                >
                                    {BANKS.map((bank) => (
                                        <option key={bank.code} value={bank.code}>
                                            {bank.name} ({bank.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='grid gap-3 sm:grid-cols-2'>
                            <div>
                                <label className='text-sm font-medium'>Account Number</label>
                                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                            </div>
                            <div>
                                <label className='text-sm font-medium'>Account Name</label>
                                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className='text-sm font-medium'>Note</label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder='Additional information for admin'
                            />
                        </div>

                        <Button type='submit' className='w-full' disabled={isPending}>
                            {isPending ? 'Submitting...' : 'Submit Payout Request'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className='w-full flex-1'>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <p className='text-sm text-muted-foreground'>All topup, payout, and package transactions.</p>
                </CardHeader>
                <CardContent>
                    {isLoadingTransactions ? (
                        <p className='text-sm text-muted-foreground'>Loading...</p>
                    ) : allTransactions.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>No transactions yet.</p>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b bg-muted/50'>
                                        <th className='text-left px-3 py-2 font-semibold'>Type</th>
                                        <th className='text-left px-3 py-2 font-semibold'>Amount</th>
                                        <th className='text-left px-3 py-2 font-semibold'>Status</th>
                                        <th className='text-left px-3 py-2 font-semibold'>Date</th>
                                        <th className='text-left px-3 py-2 font-semibold'>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTransactions.map((tx: TransactionItem) => {
                                        const isPayout = tx.type === 'PAYOUT';
                                        const isTopup = tx.type === 'TOPUP';
                                        const isPackage = tx.type === 'PACKAGE';

                                        let typeLabel = '';
                                        let typeColor = 'secondary';
                                        if (isPayout) {
                                            typeLabel = 'Payout';
                                            typeColor = 'destructive';
                                        } else if (isTopup) {
                                            typeLabel = 'Topup';
                                            typeColor = 'default';
                                        } else if (isPackage) {
                                            typeLabel = 'Package';
                                            typeColor = 'default';
                                        }

                                        const detailText = isPayout
                                            ? `${tx.payout?.bankAbbreviation || '--'} · ${maskAccount(tx.payout?.accountNumber || '')}`
                                            : isPackage
                                              ? `${tx.package?.type || '--'} (${tx.package?.duration || '--'})`
                                              : '--';

                                        return (
                                            <tr key={tx._id} className='border-b hover:bg-muted/30'>
                                                <td className='px-3 py-3'>
                                                    <Badge variant={typeColor as any}>{typeLabel}</Badge>
                                                </td>
                                                <td className='px-3 py-3 font-semibold'>
                                                    {currencyDisplay(tx.amount)}
                                                </td>
                                                <td className='px-3 py-3'>
                                                    <Badge variant={(statusTone[tx.status] as any) || 'secondary'}>
                                                        {tx.status}
                                                    </Badge>
                                                </td>
                                                <td className='px-3 py-3 text-xs'>
                                                    {tx.createdAt
                                                        ? format(new Date(tx.createdAt), 'dd/MM/yyyy')
                                                        : tx.when
                                                          ? format(new Date(tx.when), 'dd/MM/yyyy')
                                                          : '--'}
                                                </td>
                                                <td className='px-3 py-3 text-xs text-muted-foreground'>
                                                    {detailText}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WalletPayout;
