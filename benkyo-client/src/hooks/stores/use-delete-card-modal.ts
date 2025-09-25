import { create } from 'zustand';

type DeleteCardModalStore = {
    isOpen: boolean;
    cardId: string | null;
    open: (cardId: string) => void;
    close: () => void;
};

export const useDeleteCardModal = create<DeleteCardModalStore>((set) => ({
    isOpen: false,
    cardId: null,
    open: (cardId) => set({ isOpen: true, cardId }),
    close: () => set({ isOpen: false, cardId: null })
}));
