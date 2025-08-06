import { create } from 'zustand';
import { getClassRequestJoinApi } from '@/api/classApi';

interface JoinRequest {
    user: {
        _id: string;
        avatar: string;
        email: string;
        name: string;
    };
    requestDate: string;
}

interface ClassRequestJoinStore {
    joinRequests: JoinRequest[];
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
