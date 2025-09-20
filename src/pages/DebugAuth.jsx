import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DebugAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [usersRow, setUsersRow] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: { session }, error: sErr } = await supabase.auth.getSession();
        if (sErr) throw sErr;
        setSession(session);
        setUser(session?.user || null);
        if (session?.user) {
          const { data: row, error: rErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (rErr) console.warn('users row fetch error', rErr);
          setUsersRow(row);
        }
        // Fetch public.users policies via RPC to pg_policies (limited columns)
        const { data: polData, error: polErr } = await supabase
          .rpc('pg_catalog.pg_get_userbyid', []);
        if (polErr) {
          // ignore - can't access system function via anon
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', padding: 24 }}>
      <h1>Debug Auth</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <h2>Session</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <h2>User</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <h2>public.users Row</h2>
      <pre>{JSON.stringify(usersRow, null, 2)}</pre>
      <p>Visit this page after Google redirect if provisioning fails.</p>
    </div>
  );
}
