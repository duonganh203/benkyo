import { type LucideIcon } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function NavMain({
    items
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        badge?: string;
        highlight?: boolean;
    }[];
}) {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <SidebarMenu>
            {items.map((item) => {
                const isActive =
                    item.isActive !== undefined
                        ? item.isActive
                        : pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                            <Link to={item.url} className='flex items-center gap-2'>
                                <item.icon className={cn(item.highlight && 'text-sidebar-primary')} />
                                <span className={cn(item.highlight && 'text-sidebar-primary font-medium')}>
                                    {item.title}
                                </span>
                                {item.badge && (
                                    <Badge variant='secondary' className='ml-auto text-[10px] bg-sidebar-accent/50'>
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
