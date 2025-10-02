import { useEffect } from 'react';
import useAuthStore from '@/hooks/stores/use-auth-store';
import { connectWebSocket } from '@/utils/socketClient';

const useWebSocket = () => {
    const { user } = useAuthStore((state) => state);

    useEffect(() => {
        if (user?._id) {
            connectWebSocket(user._id);
        }
    }, [user?._id]);
};

export default useWebSocket;
