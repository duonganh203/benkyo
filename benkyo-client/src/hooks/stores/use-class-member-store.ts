import { create } from 'zustand';
import { getClassMemberApi } from '@/api/classApi';

interface ClassMember {
    _id: string;
    avatar: string;
    email: string;
    name: string;
}

// shape returned by getClassMemberApi
interface ClassMembersResponse {
    data: ClassMember[];
    page: number;
    hasMore: boolean;
    total: number;
}

interface ClassMemberStore {
    members: ClassMember[];
    isLoading: boolean;
    error: string | null;
    page?: number;
    hasMore?: boolean;
    total?: number;
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
            const response: ClassMembersResponse = await getClassMemberApi(classId);
            set({
                members: response.data || [],
                isLoading: false,
                page: response.page,
                hasMore: response.hasMore,
                total: response.total
            });
        } catch {
            set({ error: 'Failed to fetch members', isLoading: false });
        }
    },
    clearMembers: () => {
        set({ members: [], error: null });
    }
}));

export default useClassMemberStore;
