import { create } from 'zustand';
import { getClassMemberApi } from '@/api/classApi';

interface ClassMember {
    _id: string;
    avatar: string;
    email: string;
    name: string;
}

interface ClassMemberStore {
    members: ClassMember[];
    isLoading: boolean;
    error: string | null;
    fetchMembers: (classId: string) => Promise<void>;
    clearMembers: () => void;
}

export const useClassMemberStore = create<ClassMemberStore>((set) => ({
    members: [],
    isLoading: false,
    error: null,
    fetchMembers: async (classId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getClassMemberApi(classId);
            set({ members: response || [], isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch members', isLoading: false });
        }
    },
    clearMembers: () => {
        set({ members: [], error: null });
    }
}));

export default useClassMemberStore;
