import { useEffect, useRef, useState } from 'react';
import { useStudyFlagStore } from '../stores/use-study-store';
import useGetStudyStreak from './use-get-study-streak';

export function useStudyStreakTimer() {
    const { justStudied, latestStreak, setJustStudied } = useStudyFlagStore();
    const { data: streakData } = useGetStudyStreak();
    const [streak, setStreak] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!justStudied) return;

        const resolved = latestStreak ?? streakData?.studyStreak ?? null;
        setStreak(resolved);

        setVisible(true);
        timeoutRef.current = setTimeout(() => {
            setVisible(false);
            setJustStudied(false);
        }, 3000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [justStudied, latestStreak, streakData, setJustStudied]);

    return visible ? streak : null;
}
