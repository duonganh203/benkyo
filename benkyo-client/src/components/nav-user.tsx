import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const getSubscriptionTextClass = (user: User): string => {
    if (!user.isPro) {
        return 'text-basic';
    }

    if (user.proType?.toLowerCase().includes('premium')) {
        return 'text-gradient-premium';
    }

    return 'text-gradient-pro';
};

export function NavUser({ user }: { user: User }) {
    const { isMobile } = useSidebar();
    const { logout } = useAuthStore((store) => store);
    const textClass = getSubscriptionTextClass(user);
    const navigate = useNavigate();
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
                                    <span className={`truncate font-semibold w-[15ch] ${textClass}`}>
                                        {user.username}
                                    </span>
                                </div>

                                <span className={`truncate text-xs ${textClass}`}>{user.email}</span>
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
                                    <span className={`truncate font-semibold w-[20ch] ${textClass}`}>
                                        {user.username}
                                    </span>
                                    <span className={`truncate text-xs ${textClass}`}>{user.email}</span>
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
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <BadgeCheck />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/notification')}>
                                <Bell className='mr-2 h-4 w-4' />
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
