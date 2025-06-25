import { create } from 'zustand';

interface StudyFlagState {
    justStudied: boolean;
    latestStreak: number | null;
    setJustStudied: (val: boolean, streak?: number | null) => void;
}

export const useStudyFlagStore = create<StudyFlagState>((set) => ({
    justStudied: false,
    latestStreak: null,
    setJustStudied: (val, streak = null) => set({ justStudied: val, latestStreak: streak })
}));
