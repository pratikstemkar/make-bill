'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Convert Supabase user to our User type
function mapSupabaseUser(user: SupabaseUser) {
    return {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
        picture: user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
    };
}

export function useSupabaseAuth() {
    const { login, logout, setLoading } = useAuthStore();
    const supabase = createClient();

    // Initialize auth state from Supabase session
    const initializeAuth = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                login(mapSupabaseUser(user));
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [supabase, login, logout, setLoading]);

    // Sign in with Google
    const signInWithGoogle = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                console.error('Error signing in with Google:', error);
                toast.error('Failed to sign in with Google');
                setLoading(false);
            }
            // Don't setLoading(false) here - the page will redirect
        } catch (error) {
            console.error('Error signing in with Google:', error);
            toast.error('Failed to sign in with Google');
            setLoading(false);
        }
    }, [supabase, setLoading]);

    // Sign out
    const signOut = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
                toast.error('Failed to sign out');
            } else {
                toast.success('Signed out successfully');
            }
            logout();
            // Redirect to landing page
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Failed to sign out');
            setLoading(false);
        }
    }, [supabase, logout, setLoading]);

    // Listen to auth state changes
    useEffect(() => {
        // Track if user was already signed in to avoid showing toast on token refresh
        let wasSignedIn = false;

        // Check initial state
        supabase.auth.getUser().then(({ data: { user } }) => {
            wasSignedIn = !!user;
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                login(mapSupabaseUser(session.user));
                // Only show toast if this is a new sign in, not a token refresh
                if (!wasSignedIn) {
                    toast.success('Signed in successfully!');
                    wasSignedIn = true;
                }
            } else if (event === 'SIGNED_OUT') {
                logout();
                wasSignedIn = false;
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, login, logout]);

    return {
        signInWithGoogle,
        signOut,
        initializeAuth,
    };
}
