import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getToast } from '@/utils/getToast';
import useCreatePayout from '@/hooks/queries/use-create-payout';
import useTransactions from '@/hooks/queries/use-transactions';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

const payoutSchema = z.object({
    amount: z
        .number()
        .min(MIN_PAYOUT, `Minimum amount is ${MIN_PAYOUT.toLocaleString('vi-VN')}`)
        .refine((val) => val % STEP === 0, { message: `Amount must be a multiple of ${STEP}` }),
    bankAbbreviation: z.string().min(1, 'Bank is required'),
    accountNumber: z.string().min(1, 'Account number is required').min(6, 'Account number must be at least 6 digits'),
    accountName: z.string().min(1, 'Account name is required').min(3, 'Account name must be at least 3 characters'),
    note: z.string().optional(),
    paymentMethod: z.string().default('BANK_TRANSFER')
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

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
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingValues, setPendingValues] = useState<PayoutFormValues | null>(null);

    const form = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            amount: MIN_PAYOUT,
            bankAbbreviation: '',
            accountNumber: '',
            accountName: '',
            note: '',
            paymentMethod: 'BANK_TRANSFER'
        }
    });

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

    const onSubmit = (values: PayoutFormValues) => {
        if (values.amount > user!.balance) {
            getToast('error', 'Insufficient balance after pending requests.');
            return;
        }
        setPendingValues(values);
        setShowConfirmDialog(true);
    };

    const handleConfirmPayout = () => {
        if (!pendingValues) return;

        submitPayout(pendingValues, {
            onSuccess: () => {
                getToast('success', 'Payout request created successfully');
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
                queryClient.invalidateQueries({ queryKey: ['me'] });
                if (user) {
                    setUser({ ...user, balance: user.balance - pendingValues.amount });
                }
                setShowConfirmDialog(false);
                setPendingValues(null);
            },
            onError: (err) => {
                getToast('error', err.response?.data?.message || 'Failed to submit request');
                setShowConfirmDialog(false);
            }
        });
    };

    return (
        <div className='min-h-[calc(100vh-80px)] px-4 py-6 flex flex-col gap-6 lg:flex-row'>
            <Card className='w-full lg:w-2/5 max-w-xl'>
                <CardHeader>
                    <CardTitle>Payout Request</CardTitle>
                    <p className='text-sm text-muted-foreground'>Enter your bank account information.</p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            <FormField
                                control={form.control}
                                name='amount'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (VND)</FormLabel>
                                        <FormControl>
                                            <div className='flex items-center gap-2'>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    onClick={() =>
                                                        field.onChange(Math.max(MIN_PAYOUT, field.value - STEP))
                                                    }
                                                    className='h-10 w-10'
                                                >
                                                    –
                                                </Button>
                                                <Input
                                                    value={field.value.toLocaleString('vi-VN')}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value.replace(/\D/g, '')) || 0)
                                                    }
                                                    className='text-right font-semibold'
                                                />
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    onClick={() => field.onChange(field.value + STEP)}
                                                    className='h-10 w-10'
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <p className='text-xs text-muted-foreground'>
                                            Available balance: {currencyDisplay(user!.balance)}
                                        </p>
                                        {pendingAmount > 0 && (
                                            <p className='text-xs text-muted-foreground'>
                                                Pending: {currencyDisplay(pendingAmount)}
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='bankAbbreviation'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select bank' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {BANKS.map((bank) => (
                                                    <SelectItem key={bank.code} value={bank.code}>
                                                        {bank.name} ({bank.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='grid gap-3 sm:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='accountNumber'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Enter account number' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='accountName'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Enter account name' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name='note'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Additional information for admin' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type='submit' className='w-full' disabled={isPending}>
                                {isPending ? 'Submitting...' : 'Submit Payout Request'}
                            </Button>
                        </form>
                    </Form>
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

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Confirm Payout Request</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-3'>
                        <p className='text-sm text-muted-foreground'>
                            Please review your payout information before submitting:
                        </p>
                        {pendingValues && (
                            <div className='bg-muted p-4 rounded-md space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='font-semibold'>Amount:</span>
                                    <span className='font-bold text-foreground'>
                                        {currencyDisplay(pendingValues.amount)}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-semibold'>Bank:</span>
                                    <span className='text-foreground'>
                                        {BANKS.find((b) => b.code === pendingValues.bankAbbreviation)?.name ||
                                            pendingValues.bankAbbreviation}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-semibold'>Account Number:</span>
                                    <span className='text-foreground'>{pendingValues.accountNumber}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-semibold'>Account Name:</span>
                                    <span className='text-foreground'>{pendingValues.accountName}</span>
                                </div>
                                {pendingValues.note && (
                                    <div className='flex flex-col gap-1'>
                                        <span className='font-semibold'>Note:</span>
                                        <span className='text-foreground text-xs'>{pendingValues.note}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className='text-xs text-muted-foreground'>
                            Are you sure you want to submit this payout request? This action cannot be undone.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant='destructive' onClick={handleConfirmPayout} disabled={isPending}>
                            {isPending ? 'Submitting...' : 'Confirm Payout'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WalletPayout;
