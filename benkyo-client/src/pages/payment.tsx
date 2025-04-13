import QrCode from '@/components/qr-code';
import { Card, CardContent } from '@/components/ui/card';
import { useParams } from 'react-router-dom';

const Payment = () => {
    const { packageId } = useParams<{ packageId: string }>();
    return (
        <div className='min-h-screen bg-slate-50 py-12 px-4'>
            <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl font-bold text-center mb-8'>Complete Your Payment</h1>
                <div className='grid md:grid-cols-7 gap-8'>
                    <div className='md:col-span-4 z-10'>
                        <QrCode packageId={packageId!} />
                    </div>
                    <div className='md:col-span-3'>
                        <Card>
                            <CardContent className='pt-6'>
                                <h3 className='text-xl font-bold mb-4'>Payment Instructions</h3>
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
            </div>
        </div>
    );
};

export default Payment;
