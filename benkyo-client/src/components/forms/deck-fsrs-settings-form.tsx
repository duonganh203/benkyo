import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RotateCcw, Save, Settings, Sparkles, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useUpdateDeckFsrsParams } from '@/hooks/queries/use-update-deck-fsrs-params';
import { DeckDetails } from '@/types/deck';
import { FSRSParamsSchema } from '@/schemas/deckSchema';
import useMe from '@/hooks/queries/use-me';
import { getToast } from '@/utils/getToast';
import { useQueryClient } from '@tanstack/react-query';
import { FSRSInfoButton } from '@/components/fsrs-info-button';
import { useGetOptimizationStatus } from '@/hooks/queries/use-get-optimization-status';
import { useTriggerOptimization } from '@/hooks/queries/use-trigger-optimization';

type FSRSParams = z.infer<typeof FSRSParamsSchema>;

// Fallback default values if user doesn't have FSRS params
const FALLBACK_FSRS_PARAMS: FSRSParams = {
    request_retention: 0.9,
    maximum_interval: 36500,
    w: [
        0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11,
        0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621
    ],
    enable_fuzz: false,
    enable_short_term: true,
    card_limit: 50,
    lapses: 8
};

interface DeckFSRSSettingsFormProps {
    deck: DeckDetails;
}

export const DeckFSRSSettingsForm = ({ deck }: DeckFSRSSettingsFormProps) => {
    const { data: currentUser } = useMe();
    const queryClient = useQueryClient();
    const { mutateAsync: updateFsrsParams, isPending } = useUpdateDeckFsrsParams();
    const { data: optimizationStatus, isLoading: isLoadingStatus } = useGetOptimizationStatus(deck._id);
    const { mutate: triggerOptimization, isPending: isOptimizing } = useTriggerOptimization();

    // Get user's FSRS params or fallback to defaults
    const getUserFsrsParams = (): FSRSParams => {
        const userParams = currentUser?.fsrsParams;
        return {
            request_retention: userParams?.request_retention ?? FALLBACK_FSRS_PARAMS.request_retention,
            maximum_interval: userParams?.maximum_interval ?? FALLBACK_FSRS_PARAMS.maximum_interval,
            w: userParams?.w ?? FALLBACK_FSRS_PARAMS.w,
            enable_fuzz: userParams?.enable_fuzz ?? FALLBACK_FSRS_PARAMS.enable_fuzz,
            enable_short_term: userParams?.enable_short_term ?? FALLBACK_FSRS_PARAMS.enable_short_term,
            card_limit: userParams?.card_limit ?? FALLBACK_FSRS_PARAMS.card_limit,
            lapses: userParams?.lapses ?? FALLBACK_FSRS_PARAMS.lapses
        };
    };

    const form = useForm<FSRSParams & { show_weights: boolean }>({
        resolver: zodResolver(FSRSParamsSchema),
        defaultValues: {
            ...getUserFsrsParams(),
            show_weights: false
        }
    });

    // Reset form when deck or user changes
    useEffect(() => {
        const userDefaults = getUserFsrsParams();
        const deckParams = deck.fsrsParams || {};
        const initialParams: FSRSParams = {
            request_retention: deckParams.request_retention ?? userDefaults.request_retention,
            maximum_interval: deckParams.maximum_interval ?? userDefaults.maximum_interval,
            w: deckParams.w ?? userDefaults.w,
            enable_fuzz: deckParams.enable_fuzz ?? userDefaults.enable_fuzz,
            enable_short_term: deckParams.enable_short_term ?? userDefaults.enable_short_term,
            card_limit: deckParams.card_limit ?? userDefaults.card_limit,
            lapses: deckParams.lapses ?? userDefaults.lapses
        };

        form.reset(initialParams);
    }, [deck, currentUser, form]);

    const onSubmit = async (data: FSRSParams) => {
        try {
            await updateFsrsParams({
                deckId: deck._id,
                fsrsParams: data
            });
            queryClient.invalidateQueries({ queryKey: ['deck', deck._id] });
            getToast('success', 'FSRS parameters updated successfully!');
            // Reset form dirty state after successful save
            form.reset(data);
        } catch (error) {
            console.error(error);
            getToast('error', 'Failed to update FSRS parameters');
        }
    };

    const handleReset = () => {
        const userDefaults = getUserFsrsParams();
        form.reset(userDefaults);
    };

    const wArrayInput = form.watch('w')?.join(', ') || '';
    const isWArrayValid = form.watch('w')?.length === 19;
    const isDirty = form.formState.isDirty;

    const handleWArrayChange = (value: string) => {
        try {
            const numbers = value
                .split(',')
                .map((n) => parseFloat(n.trim()))
                .filter((n) => !isNaN(n));

            if (numbers.length === 19) {
                form.setValue('w', numbers, { shouldDirty: true });
            }
        } catch (error) {
            console.error(error);
            // Invalid input, don't update
        }
    };

    return (
        <Card className='w-full'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Settings className='h-5 w-5' />
                    FSRS Algorithm Settings
                </CardTitle>
                <CardDescription>
                    Customize the Free Spaced Repetition Scheduler parameters for this deck. These settings will
                    override your personal FSRS settings for this deck only. Values shown reflect your current settings
                    as the starting point.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Basic Settings */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-2'>
                                <h3 className='text-lg font-semibold'>Basic Settings</h3>
                                <Badge variant='outline' className='text-xs'>
                                    Core parameters
                                </Badge>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <FormField
                                    control={form.control}
                                    name='request_retention'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Retention Rate</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    min='0.1'
                                                    max='1.0'
                                                    step='0.01'
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <p className='text-xs text-muted-foreground'>
                                                Recommended: 0.9 (90% retention rate)
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='maximum_interval'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Interval (days)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    min='1'
                                                    max='100000'
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <p className='text-xs text-muted-foreground'>
                                                Maximum days between reviews (default: 36500)
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='card_limit'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Daily New Cards Limit</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    min='1'
                                                    max='1000'
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <p className='text-xs text-muted-foreground'>
                                                Maximum new cards per day (default: 50)
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='lapses'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lapse Threshold</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    min='1'
                                                    max='100'
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <p className='text-xs text-muted-foreground'>
                                                Number of failed reviews before resetting (default: 8)
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Advanced Settings */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-2'>
                                <h3 className='text-lg font-semibold'>Advanced Settings</h3>
                                <Badge variant='outline' className='text-xs'>
                                    Fine-tuning
                                </Badge>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <FormField
                                    control={form.control}
                                    name='enable_fuzz'
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className='flex items-center justify-between'>
                                                <FormLabel>Enable Fuzzing</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </div>
                                            <p className='text-xs text-muted-foreground'>
                                                Adds small random variations to intervals to prevent clustering
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='enable_short_term'
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className='flex items-center justify-between'>
                                                <FormLabel>Enable Short-term Scheduler</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </div>
                                            <p className='text-xs text-muted-foreground'>
                                                Optimizes scheduling for short-term memory retention
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='show_weights'
                                    render={({ field }) => (
                                        <FormItem className='md:col-span-2'>
                                            <div className='flex items-center justify-between'>
                                                <FormLabel>Show Algorithm Weights Configuration</FormLabel>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </div>
                                            <p className='text-xs text-muted-foreground'>
                                                Enable advanced FSRS algorithm weights customization (expert level)
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {form.watch('show_weights') && (
                            <>
                                <Separator />

                                {/* Algorithm Weights */}
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='text-lg font-semibold'>Algorithm Weights</h3>
                                        <Badge variant='outline' className='text-xs'>
                                            Expert level
                                        </Badge>
                                        <FSRSInfoButton variant='icon' className='h-6 w-6' />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name='w'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight Parameters (19 values)</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        rows={3}
                                                        value={wArrayInput}
                                                        onChange={(e) => handleWArrayChange(e.target.value)}
                                                        className='w-full p-2 border rounded-md text-sm font-mono'
                                                        placeholder='Enter 19 comma-separated numbers...'
                                                    />
                                                </FormControl>
                                                <div className='flex items-center gap-2'>
                                                    <Badge
                                                        variant={isWArrayValid ? 'default' : 'destructive'}
                                                        className='text-xs'
                                                    >
                                                        {isWArrayValid ? '✓ Valid' : '✗ Invalid'} (
                                                        {field.value?.length || 0}/19 values)
                                                    </Badge>
                                                    <p className='text-xs text-muted-foreground'>
                                                        Advanced FSRS algorithm weights. Only modify if you understand
                                                        the implications.
                                                    </p>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Optimization Section */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-2'>
                                <h3 className='text-lg font-semibold'>Auto-Optimization</h3>
                                <Badge variant='outline' className='text-xs'>
                                    AI-Powered
                                </Badge>
                            </div>

                            <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                                {isLoadingStatus ? (
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Loading optimization status...
                                    </div>
                                ) : optimizationStatus ? (
                                    <>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>Progress to Next Optimization</span>
                                            <span className='text-sm text-muted-foreground'>
                                                {optimizationStatus.learnedCardCount} / {optimizationStatus.threshold}{' '}
                                                cards
                                            </span>
                                        </div>
                                        <div className='w-full bg-muted rounded-full h-2'>
                                            <div
                                                className='bg-primary h-2 rounded-full transition-all duration-300'
                                                style={{
                                                    width: `${Math.min((optimizationStatus.learnedCardCount / optimizationStatus.threshold) * 100, 100)}%`
                                                }}
                                            />
                                        </div>

                                        <div className='flex items-center gap-4 text-sm'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-muted-foreground'>Status:</span>
                                                {optimizationStatus.status === 'completed' && (
                                                    <Badge className='bg-green-500/20 text-green-700 hover:bg-green-500/30'>
                                                        <CheckCircle className='h-3 w-3 mr-1' />
                                                        Completed
                                                    </Badge>
                                                )}
                                                {optimizationStatus.status === 'running' && (
                                                    <Badge className='bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'>
                                                        <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                                                        Running
                                                    </Badge>
                                                )}
                                                {optimizationStatus.status === 'pending' && (
                                                    <Badge className='bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'>
                                                        <Clock className='h-3 w-3 mr-1' />
                                                        Pending
                                                    </Badge>
                                                )}
                                                {optimizationStatus.status === 'failed' && (
                                                    <Badge className='bg-red-500/20 text-red-700 hover:bg-red-500/30'>
                                                        <XCircle className='h-3 w-3 mr-1' />
                                                        Failed
                                                    </Badge>
                                                )}
                                                {optimizationStatus.status === 'idle' && (
                                                    <Badge variant='secondary'>Idle</Badge>
                                                )}
                                            </div>

                                            {optimizationStatus.lastOptimized && (
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-muted-foreground'>Last optimized:</span>
                                                    <span>
                                                        {new Date(
                                                            optimizationStatus.lastOptimized
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {optimizationStatus.message && optimizationStatus.status !== 'idle' && (
                                            <p className='text-xs text-muted-foreground'>
                                                {optimizationStatus.message}
                                            </p>
                                        )}

                                        <Button
                                            type='button'
                                            variant='secondary'
                                            size='sm'
                                            onClick={() => triggerOptimization(deck._id)}
                                            disabled={
                                                isOptimizing ||
                                                optimizationStatus.status === 'running' ||
                                                optimizationStatus.status === 'pending'
                                            }
                                            className='mt-2'
                                        >
                                            {isOptimizing || optimizationStatus.status === 'running' ? (
                                                <>
                                                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                                    Optimizing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className='h-4 w-4 mr-2' />
                                                    Optimize Now
                                                </>
                                            )}
                                        </Button>
                                        <p className='text-xs text-muted-foreground'>
                                            Optimization automatically runs after learning{' '}
                                            {optimizationStatus.threshold} new cards. You can also trigger it manually
                                            (requires at least 50 reviews).
                                        </p>
                                    </>
                                ) : (
                                    <p className='text-sm text-muted-foreground'>Optimization status unavailable.</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                            <Button
                                type='submit'
                                disabled={isPending || !isDirty || (form.watch('show_weights') && !isWArrayValid)}
                                className='flex items-center gap-2'
                            >
                                <Save className='h-4 w-4' />
                                Save Changes
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isPending}
                                className='flex items-center gap-2'
                            >
                                <RotateCcw className='h-4 w-4' />
                                Reset to My Settings
                            </Button>

                            {isDirty && (
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse' />
                                    Unsaved changes
                                </div>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
