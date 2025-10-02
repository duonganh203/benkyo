import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from '../app-sidebar';
import { connectWebSocket } from '@/utils/socketClient';

const ProtectedRoute = () => {
    const user = useAuthStore((state) => state.user);
    if (!user) return <Navigate to='/login' />;

    connectWebSocket(user.email);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className='flex-1 bg-primary/2'>
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ProtectedRoute;
