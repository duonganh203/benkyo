import { create } from 'zustand';
import { getClassVisitedApi } from '@/api/classApi';

interface VisitHistory {
    userId: {
        _id: string;
        email: string;
        name: string;
    };
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
            set({ visitedHistory: response || [], isLoading: false });
        } catch {
            set({ error: 'Failed to fetch visited users', isLoading: false });
        }
    },
    clearVisitedHistory: () => {
        set({ visitedHistory: [], error: null });
    }
}));

export default useClassVisitedStore;
