import { useEffect, useState, useRef } from 'react';
import useAuthStore from '@/hooks/stores/use-auth-store';

export function useLoginStreakTimer() {
    const token = useAuthStore((state) => state.token);
    const [showStreak, setShowStreak] = useState(false);
    const prevTokenRef = useRef<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';

        if (token && !prevTokenRef.current && justLoggedIn) {
            setShowStreak(true);

            timeoutRef.current = setTimeout(() => {
                setShowStreak(false);
                sessionStorage.removeItem('justLoggedIn');
            }, 10000);

            prevTokenRef.current = token;
        }

        if (!token) {
            prevTokenRef.current = null;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [token]);

    return showStreak;
}
