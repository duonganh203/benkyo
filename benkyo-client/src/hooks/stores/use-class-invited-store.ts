import { create } from 'zustand';
import { getClassInvitedApi } from '@/api/classApi';
import type { ClassInvitedResponse } from '@/types/class';

interface ClassInvitedStore {
    invited: ClassInvitedPaged;
    isLoading: boolean;
    error: string | null;
    fetchInvitedUsers: (classId: string, page?: number, limit?: number) => Promise<void>;
    clearInvitedUsers: () => void;
}

const emptyPaged: ClassInvitedPaged = {
    data: [],
    page: 1,
    hasMore: false,
    total: 0
};

export const useClassInvitedStore = create<ClassInvitedStore>((set) => ({
    invited: emptyPaged,
    isLoading: false,
    error: null,
    fetchInvitedUsers: async (classId: string, page: number = 1, limit: number = 20) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getClassInvitedApi(classId);
            set({ invitedUsers: response.data || [], isLoading: false });
        } catch {
            set({ error: 'Failed to fetch invited users', isLoading: false });
        }
    },
    clearInvitedUsers: () => {
        set({ invited: emptyPaged, error: null });
    }
}));

export default useClassInvitedStore;
