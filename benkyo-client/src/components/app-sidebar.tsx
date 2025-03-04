'use client';

import * as React from 'react';
import { Home, Library, Package, Settings2, Sparkles } from 'lucide-react';

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
            icon: Sparkles
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
    return (
        <Sidebar className='border-r-0' {...props}>
            <SidebarHeader>
                <SidebarMenuButton size='lg' asChild>
                    <a href='#'>
                        <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-secondary text-sidebar-primary-foreground'>
                            <img src='/images/logo.png' className='size-5' />
                        </div>
                        <div className='grid flex-1 text-left text-sm leading-tight'>
                            <span className='truncate font-semibold'>Benkyo</span>
                        </div>
                    </a>
                </SidebarMenuButton>
                <NavMain items={data.navMain} />
            </SidebarHeader>
            <SidebarContent></SidebarContent>
            <SidebarFooter>
                <NavUser user={user!} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
