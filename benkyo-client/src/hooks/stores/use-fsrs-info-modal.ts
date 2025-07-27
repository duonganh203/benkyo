import { create } from 'zustand';

type FSRSInfoModal = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

export const useFSRSInfoModal = create<FSRSInfoModal>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}));
