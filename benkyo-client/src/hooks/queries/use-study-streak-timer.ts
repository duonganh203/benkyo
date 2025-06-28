import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getStudyStreak } from '@/api/streakApi';
import { useStudyFlagStore } from '@/hooks/stores/use-study-store';

export function useStudyStreakTimer() {
    const { justStudied, latestStreak, setJustStudied } = useStudyFlagStore();
    const location = useLocation();
    const [streak, setStreak] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const toRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (justStudied) {
            const fetch = async () => {
                if (latestStreak != null) setStreak(latestStreak);
                else {
                    try {
                        const data = await getStudyStreak();
                        setStreak(data.studyStreak);
                    } catch {
                        setStreak(null);
                    }
                }
            };
            fetch();

            setVisible(true);
            toRef.current = setTimeout(() => {
                setVisible(false);
                setJustStudied(false);
            }, 10_000);
        }

        return () => {
            if (toRef.current) clearTimeout(toRef.current);
        };
    }, [justStudied, latestStreak, setJustStudied, location.pathname]);

    return visible ? streak : null;
}
