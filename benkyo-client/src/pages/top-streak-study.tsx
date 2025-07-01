import { Trophy, Award, Medal, Crown, Star, Sparkles } from 'lucide-react';

const topLearners = [
    { id: 1, name: 'Alex Chen', streak: 342, avatar: 'AC', school: 'Stanford University' },
    { id: 2, name: 'Maria Rodriguez', streak: 289, avatar: 'MR', school: 'MIT' },
    { id: 3, name: 'James Wilson', streak: 267, avatar: 'JW', school: 'Harvard University' },
    { id: 4, name: 'Sarah Kim', streak: 234, avatar: 'SK', school: 'UC Berkeley' },
    { id: 5, name: 'David Thompson', streak: 201, avatar: 'DT', school: 'Oxford University' },
    { id: 6, name: 'Emily Zhang', streak: 189, avatar: 'EZ', school: 'Cambridge University' },
    { id: 7, name: 'Michael Brown', streak: 176, avatar: 'MB', school: 'Yale University' },
    { id: 8, name: 'Lisa Park', streak: 165, avatar: 'LP', school: 'Princeton University' },
    { id: 9, name: 'Robert Taylor', streak: 152, avatar: 'RT', school: 'Columbia University' },
    { id: 10, name: 'Jennifer Lee', streak: 143, avatar: 'JL', school: 'UCLA' }
];

const TopLearners = () => {
    const topThree = topLearners.slice(0, 3);
    const restOfList = topLearners.slice(3);

    const getPodiumIcon = (position: number) => {
        switch (position) {
            case 1:
                return <Crown className='w-8 h-8 text-yellow-400' />;
            case 2:
                return <Trophy className='w-7 h-7 text-sky-400' />;
            case 3:
                return <Medal className='w-6 h-6 text-orange-400' />;
            default:
                return null;
        }
    };

    const getPodiumStyling = (position: number) => {
        switch (position) {
            case 1:
                return 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 h-48 order-2 shadow-2xl';
            case 2:
                return 'bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 h-40 order-1 shadow-xl';
            case 3:
                return 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 h-32 order-3 shadow-xl';
            default:
                return '';
        }
    };

    return (
        <div className='min-h-screen flex flex-col mx-auto max-w-[1200px] bg-background text-foreground'>
            <main className='container flex-1 py-8 px-4 md:px-6'>
                {/* Hero Section */}
                <div className='relative z-10 mb-10'>
                    <div className='flex flex-col items-center text-center space-y-8'>
                        <div className='relative'>
                            <div className='w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg'>
                                <Trophy className='w-10 h-10 text-white' />
                            </div>
                            <div className='absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow animate-pulse'>
                                <Sparkles className='w-3 h-3 text-white' />
                            </div>
                            <div className='absolute -bottom-1 -left-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow animate-bounce'>
                                <Star className='w-2.5 h-2.5 text-white' />
                            </div>
                            <div className='absolute top-1 -left-4 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shadow animate-pulse delay-500'>
                                <Medal className='w-2 h-2 text-white' />
                            </div>
                        </div>

                        <h1 className='text-5xl md:text-6xl font-extrabold tracking-tight'>
                            <span className='block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent'>
                                Learning
                            </span>
                            <span className='block bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent'>
                                Champions
                            </span>
                        </h1>

                        <div className='inline-flex items-center space-x-2 bg-muted/70 backdrop-blur-sm rounded-full px-6 py-3 border border-border shadow'>
                            <Award className='w-5 h-5 text-primary' />
                            <span className='text-primary font-semibold'>Hall of Fame</span>
                        </div>
                    </div>
                </div>

                {/* Podium */}
                <section className='mb-20'>
                    <div className='text-center mb-20'>
                        <div className='inline-flex items-center justify-center w-14 h-14 bg-primary rounded-full mb-4 shadow-lg'>
                            <Award className='w-7 h-7 text-white' />
                        </div>
                        <h2 className='text-3xl font-bold'>Top 3 Champions</h2>
                        <p className='text-muted-foreground'>The ultimate learning legends</p>
                    </div>

                    <div className='flex items-end justify-center gap-6 max-w-4xl mx-auto'>
                        {topThree.map((learner, index) => (
                            <div
                                key={learner.id}
                                className={`${getPodiumStyling(index + 1)} flex-1 max-w-xs rounded-t-2xl relative hover:scale-105 transition-transform duration-300 cursor-pointer`}
                            >
                                <div className='absolute -top-14 left-1/2 -translate-x-1/2'>
                                    <div className='w-20 h-20 bg-background rounded-full flex items-center justify-center shadow border-4 border-border mb-2'>
                                        <span className='text-xl font-bold'>{learner.avatar}</span>
                                    </div>
                                    <div className='flex justify-center'>{getPodiumIcon(index + 1)}</div>
                                </div>

                                <div className='absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-white w-full px-2'>
                                    <h3 className='font-bold text-lg'>{learner.name}</h3>
                                    <p className='text-2xl font-bold'>{learner.streak}</p>
                                    <p className='text-xs opacity-90'>days</p>
                                    <p className='text-xs opacity-80'>{learner.school}</p>
                                </div>

                                <div className='absolute top-3 right-3 bg-muted/30 backdrop-blur-md rounded-full px-3 py-1 border border-border'>
                                    <span className='font-bold text-sm'>#{index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Hall of Fame */}
                <section className='mb-20 max-w-4xl mx-auto'>
                    <div className='text-center mb-8'>
                        <h2 className='text-2xl font-bold'>Hall of Fame</h2>
                        <p className='text-muted-foreground'>Positions 4‑10</p>
                    </div>
                    <div className='space-y-4'>
                        {restOfList.map((learner, index) => (
                            <div
                                key={learner.id}
                                className='bg-muted/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-muted hover:shadow-md transition-transform duration-300 hover:scale-[1.02] border border-border'
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-6'>
                                        <div className='flex items-center space-x-4'>
                                            <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md'>
                                                #{index + 4}
                                            </div>
                                            <div className='w-10 h-10 bg-background rounded-xl flex items-center justify-center border-2 border-border'>
                                                <span className='font-bold'>{learner.avatar}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className='text-lg font-bold'>{learner.name}</h3>
                                            <p className='text-muted-foreground text-sm'>{learner.school}</p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div className='text-2xl font-bold text-sky-400'>{learner.streak}</div>
                                        <div className='text-muted-foreground text-sm'>days streak</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Stats */}
                <section className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20'>
                    <div className='bg-muted/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-border shadow-sm hover:shadow-lg'>
                        <div className='text-3xl font-bold text-sky-400 mb-2'>2,258</div>
                        <div className='text-muted-foreground'>Total Days</div>
                    </div>
                    <div className='bg-muted/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-border shadow-sm hover:shadow-lg'>
                        <div className='text-3xl font-bold text-indigo-400 mb-2'>10</div>
                        <div className='text-muted-foreground'>Top Learners</div>
                    </div>
                    <div className='bg-muted/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-border shadow-sm hover:shadow-lg'>
                        <div className='text-3xl font-bold text-purple-400 mb-2'>342</div>
                        <div className='text-muted-foreground'>Longest Streak</div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TopLearners;
