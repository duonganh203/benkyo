import { create } from 'zustand';

type GenerateQuizModal = {
    isOpen: boolean;
    deckId: string | null;
    open: (deckId: string) => void;
    close: () => void;
};

export const useGenerateQuizModal = create<GenerateQuizModal>((set) => ({
    isOpen: false,
    deckId: null,
    open: (deckId) => set({ isOpen: true, deckId }),
    close: () => set({ isOpen: false })
}));
