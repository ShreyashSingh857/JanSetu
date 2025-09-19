import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// This page handles the redirect from Google OAuth.
// It finalizes the session, ensures a user row exists with selected user_type (stored in localStorage before redirect), and routes appropriately.
export default function OAuthCallback() {
  const [status, setStatus] = useState('Finishing sign in...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const finalize = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          setStatus('No active session found.');
          return;
        }

        const supaUser = session.user;
        const storedType = localStorage.getItem('pendingUserType');
        const intendedType = storedType || supaUser.user_metadata?.user_type || 'citizen';
        const existingType = supaUser.user_metadata?.user_type;

        if (existingType && storedType && existingType !== storedType) {
          setStatus('Role mismatch – signing out');
          await supabase.auth.signOut();
          localStorage.removeItem('pendingUserType');
          setError(`This account is registered as ${existingType}. Choose the correct role.`);
          return;
        }

        const userType = existingType || intendedType;

        // Update metadata if missing user_type
        if (!existingType) {
          await supabase.auth.updateUser({ data: { user_type: userType } });
        }

        // Ensure row exists in users table
        const { data: existing, error: fetchErr } = await supabase
          .from('users')
          .select('id')
          .eq('id', supaUser.id)
          .single();

        if (fetchErr && fetchErr.code === 'PGRST116') {
          // Insert
            const fullName = supaUser.user_metadata.full_name || supaUser.user_metadata.name || supaUser.email?.split('@')[0];
            const { error: insertErr } = await supabase.from('users').insert([
              { id: supaUser.id, email: supaUser.email, full_name: fullName, user_type: userType }
            ]);
            if (insertErr) console.error('User insert error', insertErr);
        }

        // Store local login markers
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', userType);
        localStorage.setItem('email', supaUser.email || '');
        localStorage.setItem('userId', supaUser.id);
        localStorage.removeItem('pendingUserType');

        setStatus('Redirecting...');
        setTimeout(() => {
          window.location.href = userType === 'citizen' ? '/citizen' : '/government';
        }, 500);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Unexpected error');
        setStatus('Failed to finalize sign-in');
      }
    };
    finalize();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-semibold mb-4">Google Sign-In</h1>
        <p className="text-gray-700 mb-2">{status}</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="mt-4 text-xs text-gray-400">If you are not redirected automatically, you can close this tab.</div>
      </div>
    </div>
  );
}
