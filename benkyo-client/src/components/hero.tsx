import { Sparkles, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const HeroSection = () => {
    return (
        <section className='relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
                    {/* Left Content */}
                    <div className='text-center lg:text-left order-2 lg:order-1'>
                        <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6 drop-shadow-sm transition-colors'>
                            Master anything <br />
                            <span className='inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300'>
                                twice as fast with Benkyo
                            </span>
                        </h1>

                        <p className='text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium transition-colors'>
                            Benkyo blends spaced repetition and AI to help you lock in anything, medical concepts, and
                            history for the long term.
                        </p>

                        <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                            <Button className='flex items-center justify-center gap-2 px-8 py-4 text-lg rounded-full font-semibold shadow-xl shadow-primary-200 dark:shadow-none hover:-translate-y-1'>
                                Start learning now
                                <ArrowRight size={20} />
                            </Button>
                            <Button
                                variant='outline'
                                className='flex items-center justify-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 px-8 py-4 rounded-full font-semibold text-lg hover:-translate-y-1'
                            >
                                <Play size={18} fill='currentColor' />
                                Watch demo
                            </Button>
                        </div>

                        <div className='mt-10 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors'>
                            <Badge
                                variant='secondary'
                                className='flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-full backdrop-blur-sm'
                            >
                                <CheckCircle2 size={18} className='text-green-500' />
                                Built for serious learners
                            </Badge>
                            <Badge
                                variant='secondary'
                                className='flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-full backdrop-blur-sm'
                            >
                                <CheckCircle2 size={18} className='text-green-500' />
                                AI + spaced repetition together
                            </Badge>
                        </div>
                    </div>

                    {/* Right Content - Glassmorphism UI Card */}
                    <div className='order-1 lg:order-2 relative mx-auto w-full max-w-[420px]'>
                        {/* Decorative blob behind */}
                        <div className='absolute -top-10 -right-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse'></div>
                        <div className='absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl'></div>

                        {/* Glass Card */}
                        <Card className='relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-all duration-500 ease-out'>
                            <CardHeader className='flex flex-row items-center justify-between p-0 mb-6'>
                                <div className='flex gap-2'>
                                    <div className='w-3 h-3 rounded-full bg-red-400'></div>
                                    <div className='w-3 h-3 rounded-full bg-yellow-400'></div>
                                    <div className='w-3 h-3 rounded-full bg-green-400'></div>
                                </div>
                                <CardTitle className='text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider'>
                                    Deck
                                </CardTitle>
                            </CardHeader>

                            <CardContent className='space-y-6 p-0'>
                                <div className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-inner text-center border border-gray-50 dark:border-slate-700 transition-colors'>
                                    <div className='w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-300'>
                                        <Sparkles size={24} />
                                    </div>
                                    <h3 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>Ephemeral</h3>
                                    <p className='text-gray-400 text-sm italic mb-4'>/əˈfem.ər.əl/</p>
                                    <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                                        Lasting for a very short time.
                                        <br />
                                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                                            Keep it in long-term memory with spaced repetition.
                                        </span>
                                    </p>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <Button variant='destructive' className='py-3 rounded-xl text-sm font-bold'>
                                        Review again
                                    </Button>
                                    <Button className='py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-200 dark:shadow-none'>
                                        Mark as mastered
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Floating Badge */}
                        <div
                            className='absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce transition-colors'
                            style={{ animationDuration: '3s' }}
                        >
                            <div className='bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400'>
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <div className='text-xs text-gray-500 dark:text-gray-400'>Progress</div>
                                <div className='font-bold text-gray-900 dark:text-white'>+15 new terms</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
