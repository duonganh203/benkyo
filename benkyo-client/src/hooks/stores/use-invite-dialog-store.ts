import { create } from 'zustand';

type InviteDialogState = {
    isOpen: boolean;
    className: string;
    description: string;
    onAccept: () => void;
    onReject: () => void;
    open: (className: string, description: string, onAccept: () => void, onReject: () => void) => void;
    close: () => void;
};

export const useInviteDialogStore = create<InviteDialogState>((set) => ({
    isOpen: false,
    className: '',
    description: '',
    onAccept: () => {},
    onReject: () => {},
    open: (className, description, onAccept, onReject) =>
        set({ isOpen: true, className, description, onAccept, onReject }),
    close: () => set({ isOpen: false })
}));
