'use client';

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { User } from '@/types/auth';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';

export function NavUser({ user }: { user: User }) {
    const { isMobile } = useSidebar();
    const { logout } = useAuthStore((store) => store);
    const proTypes = [
        { label: 'Basic', color: 'text-green-600 border-green-600 bg-green-100' },
        { label: 'Pro', color: 'text-violet-600 border-violet-600 bg-violet-100' },
        { label: 'Premium', color: 'text-pink-600 border-pink-600 bg-pink-100' }
    ];
    const indexType = user.proType === 'Basic' ? 0 : user.proType === 'Pro' ? 1 : 2;
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
                        >
                            <Avatar className='h-8 w-8 rounded-lg'>
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <div className='flex items-center gap-2'>
                                    <span className='truncate font-semibold'>{user.username}</span>
                                    {user.isPro && (
                                        <Badge variant='secondary' className={`${proTypes[indexType].color}`}>
                                            {proTypes[indexType].label}
                                        </Badge>
                                    )}
                                </div>

                                <span className='truncate text-xs'>{user.email}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    <AvatarImage src={user.avatar} alt={user.username} />
                                    <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-semibold'>{user.username}</span>
                                    <span className='truncate text-xs'>{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!user.isPro && (
                            <DropdownMenuGroup>
                                <Link to='/package'>
                                    <DropdownMenuItem>
                                        <Sparkles />
                                        Upgrade To Pro
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuGroup>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
