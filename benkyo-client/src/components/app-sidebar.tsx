import { useMemo } from 'react';
import {
    Home,
    Library,
    Package,
    Settings2,
    Sparkles,
    Clock,
    BadgeInfo,
    NotebookPen,
    Cat,
    Bell,
    School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
    SidebarSeparator
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { ModeToggle } from './mode-toggle';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useCreateDeckModal } from '@/hooks/stores/use-create-deck-modal';
import useGetUserDecks from '@/hooks/queries/use-get-user-decks';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { useNotificationStore } from '@/hooks/stores/use-notification-store';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuthStore((store) => store);
    const { open } = useCreateDeckModal((store) => store);
    const { data: decks = [], isLoading } = useGetUserDecks();

    const latestDecks = useMemo(() => {
        return [...decks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
    }, [decks]);

    const notificationCount = useNotificationStore((state) => state.notifications.length);

    const navData = useMemo(
        () => ({
            navMain: [
                {
                    title: 'Notifications',
                    url: '/notification',
                    icon: Bell,
                    badge: notificationCount.toString()
                },
                {
                    title: 'Home',
                    url: '/home',
                    icon: Home
                },
                {
                    title: 'Community',
                    url: '/community',
                    icon: Package
                },
                {
                    title: 'All decks',
                    url: '/my-decks',
                    icon: Library,
                    badge: decks.length.toString()
                },
                {
                    title: 'Quizzes',
                    url: '/quizzes',
                    icon: NotebookPen,
                    highlight: true
                },
                {
                    title: 'SUPER CAT',
                    url: '/ai-chat',
                    icon: Cat,
                    highlight: true
                },
                {
                    title: 'Classes',
                    url: '/class/list',
                    icon: School
                },
                {
                    title: 'Settings',
                    url: '/profile',
                    icon: Settings2
                }
            ]
        }),
        [decks.length, notificationCount]
    );

    return (
        <Sidebar variant='inset' className='border-r-0' {...props}>
            <SidebarHeader className='border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm'>
                <SidebarMenuButton size='lg' asChild className='mb-2'>
                    <div className='flex items-center'>
                        <Link to='/home' className='flex flex-1 items-center gap-3 group'>
                            <div className='flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary shadow-sm group-hover:bg-sidebar-primary/15 transition-all duration-200'>
                                <img src='/images/logo.png' className='size-5' />
                            </div>
                            <div className='grid flex-1 text-left leading-tight'>
                                <span className='font-semibold text-base text-sidebar-foreground tracking-tight'>
                                    Benkyo
                                </span>
                                <span className='text-[10px] text-sidebar-foreground/60'>Smart Flashcards</span>
                            </div>
                        </Link>
                        <ModeToggle />
                    </div>
                </SidebarMenuButton>

                <Button
                    className='w-full justify-center bg-sidebar-primary/10 border-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary/15 hover:border-sidebar-primary/30 transition-all duration-200 shadow-sm'
                    variant='outline'
                    size='sm'
                    onClick={() => open()}
                >
                    <Sparkles className='h-4 w-4 mr-2' />
                    Create new deck
                </Button>
            </SidebarHeader>

            <SidebarContent className='px-2 py-4 overflow-hidden'>
                <div className='mb-6'>
                    <NavMain items={navData.navMain} />
                </div>

                <SidebarSeparator className='mb-4' />

                <div className='space-y-3'>
                    <div className='flex items-center justify-between px-2'>
                        <h4 className='text-sm font-medium text-sidebar-foreground/80 flex items-center'>
                            <Clock className='h-4 w-4 mr-2 text-sidebar-primary' />
                            Recent Decks
                        </h4>
                        <Badge
                            variant='secondary'
                            className='text-[10px] bg-sidebar-accent/50 text-sidebar-accent-foreground'
                        >
                            {decks.length}
                        </Badge>
                    </div>

                    <div className='rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3'>
                        {isLoading ? (
                            <div className='space-y-2'>
                                <Skeleton className='h-8 w-full' />
                                <Skeleton className='h-8 w-full' />
                                <Skeleton className='h-8 w-full' />
                            </div>
                        ) : latestDecks.length > 0 ? (
                            <ScrollArea className='max-h-48'>
                                <div className='space-y-1'>
                                    {latestDecks.map((deck) => (
                                        <Link
                                            key={deck._id}
                                            to={`/deck/${deck._id}`}
                                            className='flex items-center justify-between rounded-md p-2 text-sm hover:bg-sidebar-accent/50 transition-colors group'
                                        >
                                            <span className='font-medium truncate max-w-[140px] text-sidebar-foreground group-hover:text-sidebar-primary transition-colors'>
                                                {deck.name}
                                            </span>
                                            <Badge
                                                variant='outline'
                                                className='ml-2 bg-sidebar/50 border-sidebar-border text-sidebar-foreground/60 text-[10px] px-2 py-0.5'
                                            >
                                                {formatDistanceToNow(new Date(deck.updatedAt), { addSuffix: true })}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-6 text-center'>
                                <BadgeInfo className='h-8 w-8 text-sidebar-foreground/40 mb-3' />
                                <p className='text-sm text-sidebar-foreground/60 mb-2'>No decks yet</p>
                                <p className='text-xs text-sidebar-foreground/40'>
                                    Create your first deck to get started
                                </p>
                            </div>
                        )}

                        {decks.length > 5 && (
                            <div className='mt-3 pt-3 border-t border-sidebar-border'>
                                <Link
                                    to='/my-decks'
                                    className='text-xs text-sidebar-primary hover:text-sidebar-primary/80 flex items-center justify-center hover:underline w-full transition-colors'
                                >
                                    View all {decks.length} decks
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className='border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm'>
                <NavUser user={user!} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
