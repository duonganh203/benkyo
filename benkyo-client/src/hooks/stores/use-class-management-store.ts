import { create } from 'zustand';
import { ClassManagementResponseDto } from '@/types/class';

interface ClassManagementStore {
    classData: ClassManagementResponseDto | null;
    isLoading: boolean;
    error: string | null;
    setClassData: (data: ClassManagementResponseDto) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearClassData: () => void;
}

export const useClassManagementStore = create<ClassManagementStore>((set) => ({
    classData: null,
    isLoading: false,
    error: null,
    setClassData: (data) => set({ classData: data, error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearClassData: () => set({ classData: null, error: null })
}));

export default useClassManagementStore;
