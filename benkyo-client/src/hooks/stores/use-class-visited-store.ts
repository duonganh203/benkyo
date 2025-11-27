import { create } from 'zustand';
import { getClassVisitedApi } from '@/api/classApi';
import type { ClassVisitedResponse } from '@/types/class';

interface VisitHistory {
    _id: string;
    user: {
        _id: string;
        email: string;
        name: string;
        avatar?: string;
    } | null;
    lastVisit: string;
}

interface ClassVisitedStore {
    visitedHistory: VisitHistory[];
    isLoading: boolean;
    error: string | null;
    fetchVisitedHistory: (classId: string) => Promise<void>;
    clearVisitedHistory: () => void;
}

export const useClassVisitedStore = create<ClassVisitedStore>((set) => ({
    visitedHistory: [],
    isLoading: false,
    error: null,
    fetchVisitedHistory: async (classId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getClassVisitedApi(classId);
            set({ visitedHistory: (response.data as ClassVisitedResponse) || [], isLoading: false });
        } catch {
            set({ error: 'Failed to fetch visited users', isLoading: false });
        }
    },
    clearVisitedHistory: () => {
        set({ visitedHistory: [], error: null });
    }
}));

export default useClassVisitedStore;
