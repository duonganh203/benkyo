import { create } from 'zustand';
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
    fetchJoinRequests: async (_classId: string) => {
        set({ isLoading: false, error: null, joinRequests: [] });
    },
    clearJoinRequests: () => {
        set({ joinRequests: [], error: null });
    }
}));

export default useClassRequestJoinStore;
