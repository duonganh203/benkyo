import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';

type AuthStore = AuthState & {
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
};

const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, token: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token })
        }
    )
);

export default useAuthStore;
