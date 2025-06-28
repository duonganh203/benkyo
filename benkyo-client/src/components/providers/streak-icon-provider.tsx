import StreakIcon from '@/components/streak-icon';
import { useStudyStreakTimer } from '@/hooks/queries/use-study-streak-timer';

export default function StreakIconContainer() {
    const streak = useStudyStreakTimer();
    return streak !== null ? <StreakIcon count={streak} /> : null;
}
