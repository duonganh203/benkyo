import { create } from 'zustand';

type CreateDeckModal = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

export const useCreateDeckModal = create<CreateDeckModal>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}));
