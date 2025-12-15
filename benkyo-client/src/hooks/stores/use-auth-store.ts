import { AuthState, User } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthStore = AuthState & {
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setRefreshToken: (refreshToken: string | null) => void;
    updateBalance: (balance: number) => void;
    logout: () => void;
};

const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            updateBalance: (balance: number) =>
                set((state) => ({
                    user: state.user ? { ...state.user, balance } : state.user
                })),
            logout: () => set({ user: null, token: null, refreshToken: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken })
        }
    )
);

export default useAuthStore;
