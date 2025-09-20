import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(undefined);
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const ROLE_KEY = 'intent_role';

  // Load session on mount
  useEffect(() => {
    const init = async () => {
      if (!supabase) { setInitializing(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      // If returning from OAuth and we have an intent role stored, ensure profile and redirect.
      if (session?.user) {
        const intent = localStorage.getItem(ROLE_KEY);
        if (intent) {
          try { await ensureProfile(session.user, intent); } catch (e) { console.warn('ensureProfile (oauth) error', e); }
          if (window.location.pathname === '/' || window.location.pathname === '/login') {
            window.location.replace(intent === 'citizen' ? '/citizen' : '/government');
          }
          // Clear intent after handling
          localStorage.removeItem(ROLE_KEY);
        }
      }
      setInitializing(false);
    };
    init();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          const intent = localStorage.getItem(ROLE_KEY);
          if (intent) {
            ensureProfile(newSession.user, intent).finally(() => {
              if (window.location.pathname === '/' || window.location.pathname === '/login') {
                window.location.replace(intent === 'citizen' ? '/citizen' : '/government');
              }
              localStorage.removeItem(ROLE_KEY);
            });
          }
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const ensureProfile = async (u, forcedRole) => {
    if (!u) return;
    // Attempt to fetch profile
    const { data, error } = await supabase.from('users').select('id, user_type').eq('id', u.id).single();
    if (error && error.code !== 'PGRST116') {
      console.warn('Profile fetch error', error); return;
    }
    if (!data) {
      // Insert row (trigger might already handle it, but idempotent)
      const role = forcedRole || 'citizen';
      const { error: insErr } = await supabase.from('users').insert({ id: u.id, email: u.email, full_name: u.user_metadata?.full_name || u.user_metadata?.name, user_type: role });
      if (insErr && insErr.code !== '23505') console.warn('Profile insert error', insErr);
    } else if (forcedRole && data.user_type !== forcedRole) {
      // Do not auto-escalate; just warn
      console.log('Existing role differs; leaving as is.');
    }
  };

  const signUp = async ({ email, password, user_type='citizen', full_name }) => {
    if (!supabase) throw new Error('Supabase not configured');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
      if (error) throw error;
      if (data.user) {
        localStorage.setItem(ROLE_KEY, user_type);
        await ensureProfile(data.user, user_type);
      }
      return { user: data.user };
    } finally { setLoading(false); }
  };

  const signInWithPassword = async (email, password, intendedRole) => {
    if (!supabase) throw new Error('Supabase not configured');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) await ensureProfile(data.user, intendedRole);
      return { user: data.user };
    } finally { setLoading(false); }
  };

  const signInWithGoogle = async (intendedRole='citizen') => {
    if (!supabase) throw new Error('Supabase not configured');
    localStorage.setItem(ROLE_KEY, intendedRole);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) throw error;
  };

  const signOut = async () => { if (supabase) await supabase.auth.signOut(); };
  const refreshUser = async () => { if (!supabase) return null; const { data } = await supabase.auth.getUser(); setUser(data.user); return data.user; };

  const value = { session, user, loading, initializing, signUp, signInWithPassword, signInWithGoogle, signOut, refreshUser };
  return <AuthContext.Provider value={value}>{!initializing && children}</AuthContext.Provider>;
}