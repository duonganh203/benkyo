import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useGetPackages from '@/hooks/queries/use-get-packages';
import { PackageInterface } from '@/types/payment';

const groupPackagesByType = (packages: PackageInterface[]): Record<string, PackageInterface[]> => {
    return packages.reduce(
        (acc, pkg) => {
            acc[pkg.type] = acc[pkg.type] || [];
            acc[pkg.type].push(pkg);
            return acc;
        },
        {} as Record<string, PackageInterface[]>
    );
};

const Packages = () => {
    const { data: allPackages = [] } = useGetPackages();
    const groupedPackages = groupPackagesByType(allPackages);
    const tierList = Object.entries(groupedPackages);

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<PackageInterface[]>([]);
    const [selectedDuration, setSelectedDuration] = useState<'3M' | '6M' | '1Y'>('3M');
    const [isDialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();

    const openDialog = (type: string, options: PackageInterface[]) => {
        setSelectedType(type);
        setSelectedOptions(options);
        setSelectedDuration('3M');
        setDialogOpen(true);
    };

    const handleContinue = () => {
        const chosen = selectedOptions.find((p) => p.duration === selectedDuration);
        if (chosen) {
            setDialogOpen(false);
            navigate(`/payment/${chosen._id}`);
        }
    };
    if (tierList.length === 0) {
        return (
            <div className='min-h-screen flex flex-col justify-center items-center'>
                <h1 className='text-4xl font-bold mb-4'>No Packages Available</h1>
                <p className='text-lg text-muted-foreground'>Please check back later.</p>
            </div>
        );
    }

    return (
        <div className='max-w-6xl h-full flex flex-col mx-auto px-4 py-16'>
            <div className='w-full mx-auto'>
                <div className='text-center mb-10'>
                    <h1 className='text-4xl font-bold mb-4'>Choose Your Plan</h1>
                    <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
                        Select the perfect plan to enhance your learning journey.
                    </p>
                </div>

                <div className='grid md:grid-cols-3 gap-8 my-auto h-full'>
                    {tierList.map(([type, plans], index) => {
                        const sample = plans[0];
                        return (
                            <Card
                                key={type}
                                className={`relative flex flex-col ${index === 1 ? 'border-blue-400 shadow-lg scale-105' : ''}`}
                            >
                                {index === 1 && (
                                    <div className='absolute -top-4 inset-x-0 flex justify-center'>
                                        <span className='bg-[var(--color-blue-400)] text-primary-foreground px-3 py-1 text-xs font-medium rounded-full'>
                                            Most Popular
                                        </span>
                                        -
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className='text-2xl font-bold'>{type}</CardTitle>
                                    <CardDescription>{sample.name}</CardDescription>
                                </CardHeader>
                                <CardContent className='flex-grow'>
                                    <div className='mb-6'>
                                        <span className='text-4xl font-bold'>{sample.price}đ</span>
                                        <span className='text-muted-foreground'> / billing</span>
                                    </div>
                                    <ul className='space-y-3'>
                                        {sample.features.map((feature, i) => (
                                            <li key={i} className='flex items-center gap-2'>
                                                <CheckCircle2 className='h-5 w-5 text-primary flex-shrink-0' />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className='w-full' onClick={() => openDialog(type, plans)}>
                                        Get Started
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className='sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>Choose Your Billing Period</DialogTitle>
                            <DialogDescription>
                                Select a billing period for the <b>{selectedType}</b> plan. Save more with yearly
                                billing!
                            </DialogDescription>
                        </DialogHeader>

                        <div className='py-6'>
                            <RadioGroup
                                value={selectedDuration}
                                onValueChange={(val: '3M' | '6M' | '1Y') => setSelectedDuration(val)}
                                className='grid gap-4'
                            >
                                {selectedOptions.map((option) => (
                                    <label
                                        key={option.duration}
                                        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                                            selectedDuration === option.duration ? 'border-primary' : ''
                                        }`}
                                    >
                                        <div className='flex items-center gap-4'>
                                            <RadioGroupItem value={option.duration} id={option.duration} />
                                            <div>
                                                <div className='font-medium'>
                                                    {option.duration === '1Y'
                                                        ? '1-Year Billing'
                                                        : option.duration === '6M'
                                                          ? '6-Month Billing'
                                                          : '3-Month Billing'}
                                                </div>
                                                <div className='text-sm text-muted-foreground'>
                                                    {option.duration === '1Y'
                                                        ? 'Save 20% with annual billing'
                                                        : 'Pay upfront and save'}
                                                </div>
                                            </div>
                                        </div>
                                        {option.duration === '1Y' && (
                                            <span className='text-sm font-medium text-primary bg-blue-400 px-2.5 py-0.5 rounded-full'>
                                                Save 20%
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </RadioGroup>
                        </div>

                        <DialogFooter className='flex gap-2'>
                            <Button variant='outline' onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleContinue}>Continue</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Packages;
