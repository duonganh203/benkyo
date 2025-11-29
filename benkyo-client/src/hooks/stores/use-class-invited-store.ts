import { create } from 'zustand';
import { getClassInvitedApi } from '@/api/classApi';

// add minimal item + paged types
interface ClassUser {
    _id: string;
    avatar?: string;
    email?: string;
    name?: string;
}

interface ClassInvitedResponse {
    _id: string;
    user: ClassUser;
    invitedAt: Date;
}

interface ClassInvitedPaged {
    data: ClassInvitedResponse[];
    page: number;
    hasMore: boolean;
    total: number;
}

interface ClassInvitedStore {
    invited: ClassInvitedPaged;
    isLoading: boolean;
    error: string | null;
    fetchInvitedUsers: (classId: string) => Promise<void>;
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
    fetchInvitedUsers: async (classId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response: ClassInvitedPaged = await getClassInvitedApi(classId);
            set({ invited: response || emptyPaged, isLoading: false });
        } catch {
            set({ error: 'Failed to fetch invited users', isLoading: false });
        }
    },
    clearInvitedUsers: () => {
        set({ invited: emptyPaged, error: null });
    }
}));

export default useClassInvitedStore;
