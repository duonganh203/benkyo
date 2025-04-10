import { create } from 'zustand';

type SendRequestPublicModal = {
    isOpen: boolean;
    deckId: string | null;
    open: (deckId: string) => void;
    close: () => void;
};

export const useSendRequestPublicDeckModal = create<SendRequestPublicModal>((set) => ({
    isOpen: false,
    deckId: null,
    open: (deckId) => set({ isOpen: true, deckId }),
    close: () => set({ isOpen: false })
}));
