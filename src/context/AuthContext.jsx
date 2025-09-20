// Supabase Auth Context (replaces Firebase version)
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(undefined);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const syncLocal = useCallback((s) => {
    if (!s) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      return;
    }
    const u = s.user;
    localStorage.setItem('isLoggedIn', 'true');
    if (u) {
      localStorage.setItem('userId', u.id);
      localStorage.setItem('email', u.email || '');
      if (u.user_metadata?.user_type) {
        localStorage.setItem('userType', u.user_metadata.user_type);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session: current } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(current);
      setUser(current?.user || null);
      syncLocal(current);
      setInitializing(false);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [syncLocal]);

  // Listen for auth changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      setUser(sess?.user || null);
      syncLocal(sess);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [syncLocal]);

  // Helpers
  const signInWithPassword = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, user_type, full_name }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { user_type, full_name } }
    });
    setLoading(false);
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async (user_type) => {
    if (user_type) localStorage.setItem('pendingUserType', user_type);
    const redirectTo = import.meta.env.DEV
      ? 'http://localhost:5173/auth/callback'
      : 'https://jan-setu.vercel.app/auth/callback'; // change to custom domain if you add one
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) throw error;
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
  };

  const refreshUser = async () => {
    const { data: { user: refreshed } } = await supabase.auth.getUser();
    setUser(refreshed || null);
    if (refreshed?.user_metadata?.user_type) {
      localStorage.setItem('userType', refreshed.user_metadata.user_type);
    }
    return refreshed;
  };

  const value = {
    session,
    user,
    loading,
    initializing,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
}