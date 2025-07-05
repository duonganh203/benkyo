import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudyFlagStore } from '@/hooks/stores/use-study-store';
import getStudyStreak from './use-get-study-streak';

export function useStudyStreakTimer() {
    const { justStudied, latestStreak, setJustStudied } = useStudyFlagStore();
    const location = useLocation();
    const [streak, setStreak] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const { data: streakData } = getStudyStreak();
    const toRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (justStudied) {
            const loadStreak = async () => {
                if (latestStreak !== null) setStreak(latestStreak);
                else {
                    try {
                        if (streakData) {
                            setStreak(streakData.studyStreak);
                        } else {
                            setStreak(null);
                        }
                    } catch {
                        setStreak(null);
                    }
                }
            };
            loadStreak();

            setVisible(true);
            toRef.current = setTimeout(() => {
                setVisible(false);
                setJustStudied(false);
            }, 3_000);
        }

        return () => {
            if (toRef.current) clearTimeout(toRef.current);
        };
    }, [justStudied, latestStreak, setJustStudied, location.pathname]);

    return visible ? streak : null;
}
