import { create } from 'zustand';
import { getClassDeckApi } from '@/api/classApi';
import { ClassDecksResponse } from '@/types/class';

interface ClassDeckStore {
    decks: ClassDecksResponse;
    isLoading: boolean;
    error: string | null;
    fetchDecks: (classId: string) => Promise<void>;
    clearDecks: () => void;
}

export const useClassDeckStore = create<ClassDeckStore>((set) => ({
    decks: [],
    isLoading: false,
    error: null,
    fetchDecks: async (classId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getClassDeckApi(classId);
            set({ decks: response || [], isLoading: false });
        } catch {
            set({ error: 'Failed to fetch decks', isLoading: false });
        }
    },
    clearDecks: () => {
        set({ decks: [], error: null });
    }
}));

export default useClassDeckStore;
