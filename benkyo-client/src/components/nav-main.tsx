import { type LucideIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export function NavMain({
    items
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
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
                            <a href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
