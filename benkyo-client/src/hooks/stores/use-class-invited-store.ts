import { create } from 'zustand';
import { getClassInvitedApi } from '@/api/classApi';

interface InvitedUser {
    user: {
        _id: string;
        avatar: string;
        email: string;
        name: string;
    };
    invitedAt: string;
}

interface ClassInvitedStore {
    invitedUsers: InvitedUser[];
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
            set({ invitedUsers: response || [], isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch invited users', isLoading: false });
        }
    },
    clearInvitedUsers: () => {
        set({ invitedUsers: [], error: null });
    }
}));

export default useClassInvitedStore;
