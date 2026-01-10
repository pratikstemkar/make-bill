import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user: User) => {
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'auth-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
        }
    )
);
