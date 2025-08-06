import { create } from 'zustand';
import { getClassRequestJoinApi } from '@/api/classApi';
import { ClassRequestJoinResponse } from '@/types/class';

interface ClassRequestJoinStore {
    joinRequests: ClassRequestJoinResponse;
    isLoading: boolean;
    error: string | null;
    fetchJoinRequests: (classId: string) => Promise<void>;
    clearJoinRequests: () => void;
}

export const useClassRequestJoinStore = create<ClassRequestJoinStore>((set) => ({
    joinRequests: [],
    isLoading: false,
    error: null,
    fetchJoinRequests: async (classId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getClassRequestJoinApi(classId);
            set({ joinRequests: response || [], isLoading: false });
        } catch {
            set({ error: 'Failed to fetch join requests', isLoading: false });
        }
    },
    clearJoinRequests: () => {
        set({ joinRequests: [], error: null });
    }
}));

export default useClassRequestJoinStore;
