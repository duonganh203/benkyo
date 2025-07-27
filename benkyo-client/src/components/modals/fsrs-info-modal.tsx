import { useFSRSInfoModal } from '@/hooks/stores/use-fsrs-info-modal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface FSRSParameter {
    name: string;
    explanation: string;
    example: string;
}

const fsrsParameters: FSRSParameter[] = [
    {
        name: 'w[0] – Initial Stability (Again)',
        explanation: "Controls how quickly you forget if you press 'Again'.",
        example: 'Lower value = the card drops to a very short interval (minutes).'
    },
    {
        name: 'w[1] – Initial Stability (Hard)',
        explanation: "Sets the starting interval when you rate a card as 'Hard'.",
        example: "Higher value = the card will appear after a slightly longer time than 'Again'."
    },
    {
        name: 'w[2] – Initial Stability (Good)',
        explanation: "Determines the first interval when you press 'Good'.",
        example: 'Higher = the card is scheduled further into the future.'
    },
    {
        name: 'w[3] – Initial Stability (Easy)',
        explanation: "Sets the starting interval for 'Easy'.",
        example: 'Higher = the card gets a long initial gap.'
    },
    {
        name: 'w[4] – Initial Difficulty',
        explanation: "Defines how 'difficult' a card feels initially.",
        example: 'Higher = the system assumes the card is hard and gives shorter intervals.'
    },
    {
        name: 'w[5] – Recall Factor',
        explanation: 'Adjusts how much the interval grows when you remember correctly.',
        example: 'Higher = intervals increase faster if you keep recalling.'
    },
    {
        name: 'w[6] – Forgetting Factor',
        explanation: 'Adjusts how much the interval shrinks when you forget.',
        example: 'Higher = the interval drops more sharply after a miss.'
    },
    {
        name: 'w[7] – Maximum Stability Increase',
        explanation: 'Caps how quickly the interval can grow after a review.',
        example: 'Prevents intervals from jumping too far too quickly.'
    },
    {
        name: 'w[8] – Minimum Stability Loss',
        explanation: "Ensures stability doesn't drop to zero when you forget.",
        example: "Even if you miss, the card won't reset entirely."
    },
    {
        name: 'w[9] – Hard Multiplier',
        explanation: "Scales intervals when you choose 'Hard'.",
        example: "Lower value = 'Hard' keeps the card appearing sooner."
    },
    {
        name: 'w[10] – Easy Multiplier',
        explanation: "Scales intervals for 'Easy'.",
        example: "Higher value = 'Easy' pushes the card far into the future."
    },
    {
        name: 'w[11] – Stability Decay Rate',
        explanation: 'Controls how quickly stability fades when you forget.',
        example: "Higher = the card becomes 'new' again faster after a miss."
    },
    {
        name: 'w[12] – Difficulty Decay Rate',
        explanation: 'Adjusts how fast a card becomes easier over time.',
        example: "Higher = repeated success makes a card 'easy' faster."
    },
    {
        name: 'w[13] – Difficulty Growth Rate',
        explanation: 'Adjusts how fast a card becomes harder when you forget it.',
        example: 'Higher = one miss makes it much harder.'
    },
    {
        name: 'w[14] – Retrievability Factor',
        explanation: 'Controls how likely the system thinks you can recall a card at a given time.',
        example: "Lower = system assumes you'll forget sooner."
    },
    {
        name: 'w[15] – Interval Growth Limit',
        explanation: 'Hard cap for how large intervals can grow in one step.',
        example: 'Keeps the card from skipping years after one review.'
    },
    {
        name: 'w[16] – Review Ease Bonus',
        explanation: 'Adds a small bonus to intervals for consistent correct answers.',
        example: "If you always press 'Good,' the card gets slightly longer gaps."
    },
    {
        name: 'w[17] – Lapse Penalty',
        explanation: 'Reduces intervals when you forget a mature card.',
        example: 'Higher = long-term cards drop back to short intervals quickly.'
    },
    {
        name: 'w[18] – Stability Weighting',
        explanation: 'Balances the impact of difficulty vs. stability on scheduling.',
        example: "Tweaking this changes how sensitive the algorithm is to 'hard' cards."
    }
];

export const FSRSInfoModal = () => {
    const { isOpen, close } = useFSRSInfoModal((store) => store);

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className='max-w-4xl h-[90vh] flex flex-col'>
                <DialogHeader className='pb-4 flex-shrink-0'>
                    <DialogTitle className='text-2xl font-bold'>FSRS Parameters Explained</DialogTitle>
                    <DialogDescription className='text-sm'>
                        The Free Spaced Repetition Scheduler (FSRS) uses 19 parameters to optimize your learning
                        experience. Each parameter controls a different aspect of how cards are scheduled for review.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className='flex-1 min-h-0'>
                    <div className='space-y-4 pr-4'>
                        {fsrsParameters.map((param, index) => (
                            <div
                                key={index}
                                className='border rounded-lg p-4 bg-card hover:shadow-md transition-shadow'
                            >
                                <div className='flex items-start gap-3'>
                                    <Badge variant='outline' className='text-xs mt-1 shrink-0'>
                                        {index}
                                    </Badge>
                                    <div className='flex-1 space-y-2'>
                                        <h3 className='font-semibold text-foreground'>{param.name}</h3>
                                        <p className='text-muted-foreground text-sm leading-relaxed'>
                                            {param.explanation}
                                        </p>
                                        <div className='bg-muted/50 rounded-md p-3 border-l-4 border-primary/20'>
                                            <p className='text-sm'>
                                                <span className='font-medium text-primary'>Example:</span>{' '}
                                                {param.example}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className='pt-4 border-t flex-shrink-0'>
                    <div className='bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4'>
                        <p className='text-sm text-blue-700 dark:text-blue-300'>
                            <span className='font-medium'>💡 Tip:</span> These parameters are automatically optimized
                            based on your learning patterns. Advanced users can fine-tune them, but the default values
                            work well for most learners.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
