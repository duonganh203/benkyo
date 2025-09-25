import { create } from 'zustand';
import { DeckInterface } from '@/types/deck';

type UpdateDeckModalStore = {
    isOpen: boolean;
    deck: DeckInterface | null;
    open: (deck: DeckInterface) => void;
    close: () => void;
};

export const useUpdateDeckModal = create<UpdateDeckModalStore>((set) => ({
    isOpen: false,
    deck: null,
    open: (deck) => set({ isOpen: true, deck }),
    close: () => set({ isOpen: false, deck: null })
}));
