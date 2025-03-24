'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { Home, Library, Package, Settings2, Sparkles, Clock, BadgeInfo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail
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

const data = {
    navMain: [
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
            badge: '10'
        },
        {
            title: 'Ask AI',
            url: '#',
            icon: Sparkles,
            highlight: true
        },
        {
            title: 'Settings',
            url: '/settings',
            icon: Settings2
        }
    ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuthStore((store) => store);
    const { open } = useCreateDeckModal((store) => store);
    const { data: decks = [], isLoading } = useGetUserDecks();

    const latestDecks = useMemo(() => {
        return [...decks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
    }, [decks]);

    return (
        <Sidebar
            className='border-r border-border/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm'
            {...props}
        >
            <SidebarHeader className='pb-6'>
                <SidebarMenuButton size='lg' asChild className='mb-4'>
                    <div className='flex items-center'>
                        <Link to='/home' className='flex flex-1 items-center gap-3 group'>
                            <div className='flex aspect-square size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm group-hover:bg-primary/15 transition-colors'>
                                <img src='/images/logo.png' className='size-5' />
                            </div>
                            <div className='grid flex-1 text-left leading-tight'>
                                <span className='font-bold text-lg text-foreground tracking-tight'>Benkyo</span>
                                <span className='text-xs text-muted-foreground'>Smart Flashcards</span>
                            </div>
                        </Link>
                        <ModeToggle />
                    </div>
                </SidebarMenuButton>

                <div className='px-3 mb-4'>
                    <Button
                        className='w-full py-1.5 justify-center bg-primary/5 border-primary/20 text-primary/80 hover:bg-primary/10 transition-colors cursor-pointer'
                        variant='outline'
                        size='sm'
                        onClick={() => open()}
                    >
                        <Sparkles className='h-3.5 w-3.5 mr-1.5' />
                        Create new deck
                    </Button>
                </div>

                <NavMain items={data.navMain} />
            </SidebarHeader>

            <SidebarContent className='px-3'>
                <div className='rounded-lg border border-border/40 bg-muted/30 p-3'>
                    <h4 className='text-sm font-medium mb-3 flex items-center justify-between'>
                        <div className='flex items-center'>
                            <span className='bg-primary/20 text-primary rounded-full p-1 mr-2'>
                                <Clock className='h-3 w-3' />
                            </span>
                            Recent Decks
                        </div>
                        <Badge variant='secondary' className='text-[10px]'>
                            {decks.length}
                        </Badge>
                    </h4>

                    {isLoading ? (
                        <div className='space-y-2'>
                            <Skeleton className='h-6 w-full' />
                            <Skeleton className='h-6 w-full' />
                            <Skeleton className='h-6 w-full' />
                        </div>
                    ) : latestDecks.length > 0 ? (
                        <ScrollArea className='max-h-48'>
                            <div className='space-y-1.5'>
                                {latestDecks.map((deck) => (
                                    <Link
                                        key={deck._id}
                                        to={`/deck/${deck._id}`}
                                        className='flex items-center justify-between rounded-md p-1.5 text-xs hover:bg-primary/5 transition-colors'
                                    >
                                        <span className='font-medium truncate max-w-[150px]'>{deck.name}</span>
                                        <Badge
                                            variant='outline'
                                            className='ml-1 bg-muted/30 text-muted-foreground text-[10px] px-1.5'
                                        >
                                            {formatDistanceToNow(new Date(deck.updatedAt), { addSuffix: true })}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className='flex flex-col items-center justify-center py-3 text-center'>
                            <BadgeInfo className='h-4 w-4 text-muted-foreground mb-2' />
                            <p className='text-xs text-muted-foreground'>No decks yet</p>
                        </div>
                    )}

                    {decks.length > 5 && (
                        <Link
                            to='/my-decks'
                            className='mt-3 text-xs text-primary flex items-center justify-center hover:underline w-full pt-2 border-t border-border/40'
                        >
                            View all decks
                        </Link>
                    )}
                </div>
            </SidebarContent>

            <SidebarFooter className='border-t border-border/40 pt-3'>
                <NavUser user={user!} />
            </SidebarFooter>

            <SidebarRail className='bg-muted/30 border-border/40' />
        </Sidebar>
    );
}
