import { useState } from 'react';
import { CreditCard, Wallet, Info } from 'lucide-react';
import QrCode from '@/components/qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { buyPackageWithWallet } from '@/api/paymentApi';
import { getToast } from '@/utils/getToast';
import useAuthStore from '@/hooks/stores/use-auth-store';
import useGetPackages from '@/hooks/queries/use-get-packages';

const Payment = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const { data: allPackages = [] } = useGetPackages();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'qr' | 'wallet'>('wallet');

    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const packageInfo = allPackages.find((pkg) => pkg._id === packageId);

    if (!packageId || !isValidObjectId(packageId)) {
        return (
            <div className='min-h-screen flex flex-col justify-center items-center'>
                <h1 className='text-4xl font-bold mb-4'>404</h1>
                <p className='text-lg text-muted-foreground'>Oops! Package not found or invalid ID.</p>
            </div>
        );
    }

    const handleBuyWithWallet = async () => {
        if (!user) {
            getToast('error', 'Please login to continue');
            return;
        }

        if (!packageInfo) {
            getToast('error', 'Package information not found');
            return;
        }

        if (user.balance < packageInfo.price) {
            getToast('error', `Insufficient balance. You need ${packageInfo.price - user.balance}đ more`);
            setTimeout(() => {
                navigate('/wallet/topup');
            }, 1500);
            return;
        }

        setLoading(true);
        try {
            const result = await buyPackageWithWallet(packageId);
            if (result.success) {
                if (user) {
                    setUser({
                        ...user,
                        isPro: true,
                        proType: result.proType,
                        balance: user.balance - packageInfo.price
                    });
                }
                getToast('success', 'Package purchased successfully! You are now Pro!');
                setTimeout(() => {
                    navigate('/home');
                }, 2000);
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to purchase package';
            getToast('error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen py-12 px-4'>
            <div className='max-w-6xl mx-auto'>
                <h1 className='text-3xl font-bold text-center mb-2'>Complete Your Payment</h1>
                <p className='text-center text-muted-foreground mb-8'>Choose your preferred payment method below</p>

                <div className='grid md:grid-cols-2 gap-6 mb-8'>
                    <Button
                        variant={paymentMethod === 'qr' ? 'default' : 'outline'}
                        className={`h-32 text-lg flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'qr' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setPaymentMethod('qr')}
                    >
                        <CreditCard size={32} />
                        <div>
                            <div className='font-bold'>Bank Transfer</div>
                            <div className='text-xs opacity-75'>Scan QR code to pay directly from your bank</div>
                        </div>
                    </Button>
                    <Button
                        variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                        className={`h-32 text-lg flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'wallet' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setPaymentMethod('wallet')}
                    >
                        <Wallet size={32} />
                        <div>
                            <div className='font-bold'>Pay with Wallet</div>
                            <div className='text-xs opacity-75'>Deduct from your wallet balance (instant)</div>
                        </div>
                    </Button>
                </div>

                {paymentMethod === 'qr' ? (
                    <div className='grid md:grid-cols-7 gap-8'>
                        <div className='md:col-span-4 z-10 flex'>
                            <QrCode packageId={packageId!} />
                        </div>
                        <div className='md:col-span-3 flex items-center'>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <CreditCard size={24} />
                                        Bank Transfer Payment
                                    </CardTitle>
                                    <CardDescription>Scan QR code to pay from your bank account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <h3 className='text-lg font-bold mb-4'>Payment Instructions</h3>
                                    <ol className='list-decimal pl-4 space-y-3'>
                                        <li>Open your payment app on your mobile device</li>
                                        <li>Scan the QR code displayed on the left</li>
                                        <li>Confirm the payment details match what you expect</li>
                                        <li>Complete the payment within the 30-minute timeframe</li>
                                        <li>Wait for confirmation on this page</li>
                                    </ol>
                                    <div className='mt-6 p-4 bg-muted rounded-md'>
                                        <h4 className='font-medium mb-2'>Please Note:</h4>
                                        <ul className='text-sm space-y-2 text-muted-foreground'>
                                            <li>• QR code expires after 30 minutes for security</li>
                                            <li>
                                                • Do not modify the payment description. We are not responsible for any
                                                issues caused by incorrect information.
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className='max-w-2xl mx-auto'>
                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <CardTitle className='flex items-center gap-2'>
                                            <Wallet size={24} />
                                            Pay with Your Wallet
                                        </CardTitle>
                                        <CardDescription>
                                            Purchase the package using your wallet balance (Instant)
                                        </CardDescription>
                                    </div>
                                    <div className='px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold'>
                                        DEFAULT
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3'>
                                    <Info size={20} className='text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
                                    <p className='text-sm text-blue-800 dark:text-blue-200'>
                                        This is the recommended payment method. Your package will be activated
                                        immediately after purchase.
                                    </p>
                                </div>

                                {packageInfo && (
                                    <>
                                        <div className='p-4 bg-muted rounded-lg'>
                                            <div className='flex justify-between items-center mb-2'>
                                                <span className='text-muted-foreground'>Package:</span>
                                                <span className='font-semibold'>
                                                    {packageInfo.name} ({packageInfo.duration})
                                                </span>
                                            </div>
                                            <div className='flex justify-between items-center mb-2'>
                                                <span className='text-muted-foreground'>Price:</span>
                                                <span className='text-lg font-bold text-primary'>
                                                    {packageInfo.price.toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                            <div className='border-t border-border pt-2 flex justify-between items-center'>
                                                <span className='text-muted-foreground'>Your Balance:</span>
                                                <span
                                                    className={`text-lg font-bold ${user && user.balance >= packageInfo.price ? 'text-green-500' : 'text-red-500'}`}
                                                >
                                                    {user?.balance.toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                        </div>{' '}
                                        {user && user.balance < packageInfo.price && (
                                            <div className='p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg'>
                                                <p className='text-red-800 dark:text-red-200 font-medium mb-3 flex items-center gap-2'>
                                                    Insufficient Balance
                                                </p>
                                                <p className='text-sm text-red-700 dark:text-red-300 mb-4'>
                                                    You need{' '}
                                                    {(packageInfo.price - user.balance).toLocaleString('vi-VN')}đ more
                                                    to complete this purchase.
                                                </p>
                                                <Button className='w-full' onClick={() => navigate('/wallet/topup')}>
                                                    Top up Wallet
                                                </Button>
                                            </div>
                                        )}
                                        {user && user.balance >= packageInfo.price && (
                                            <div className='p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg'>
                                                <p className='text-green-800 dark:text-green-200 font-medium flex items-center gap-2'>
                                                    Sufficient Balance
                                                </p>
                                                <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
                                                    You can proceed with the purchase.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <Button
                                    className='w-full'
                                    size='lg'
                                    disabled={!user || user.balance < (packageInfo?.price || 0) || loading}
                                    onClick={handleBuyWithWallet}
                                >
                                    {loading ? 'Processing...' : 'Complete Purchase with Wallet'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
