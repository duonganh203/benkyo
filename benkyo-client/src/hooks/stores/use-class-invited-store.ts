import { create } from 'zustand';
import { getClassInvitedApi } from '@/api/classApi';
import type { ClassInvitedResponse } from '@/types/class';

interface ClassInvitedStore {
    invitedUsers: ClassInvitedResponse;
    isLoading: boolean;
    error: string | null;
    fetchInvitedUsers: (classId: string) => Promise<void>;
    clearInvitedUsers: () => void;
}

export const useClassInvitedStore = create<ClassInvitedStore>((set) => ({
    invitedUsers: [],
    isLoading: false,
    error: null,
    fetchInvitedUsers: async (classId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getClassInvitedApi(classId);
            set({ invitedUsers: response.data || [], isLoading: false });
        } catch {
            set({ error: 'Failed to fetch invited users', isLoading: false });
        }
    },
    clearInvitedUsers: () => {
        set({ invitedUsers: [], error: null });
    }
}));

export default useClassInvitedStore;
