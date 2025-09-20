import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getIssue, updateIssue } from '../services/issues';
import { useAuth } from '../context/AuthContext';
import NavBarCitizen from '../components/Citizen/NavBarCitizen';
import { FiArrowLeft, FiEdit2, FiCheck, FiLoader } from 'react-icons/fi';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialEdit = params.get('edit') === '1';
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(initialEdit);
  const [form, setForm] = useState({ title: '', description: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getIssue(id)
      .then(data => {
        if (!active) return;
        setIssue(data);
        setForm({ title: data.title, description: data.description || '', status: data.status });
      })
      .catch(e => setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      // Citizens cannot change status; only allow if user has government role (assumed user_metadata.user_type or stored profile?)
      const isGov = user?.user_metadata?.user_type === 'government' || user?.app_metadata?.claims?.role === 'government';
      const payload = { title: form.title, description: form.description };
      if (isGov) payload.status = form.status; else payload.status = issue.status; // preserve original
      const updated = await updateIssue(issue.id, payload);
      setIssue(updated);
      setEditMode(false);
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const mediaArray = (() => {
    if (!issue) return [];
    if (Array.isArray(issue.media)) return issue.media;
    if (typeof issue.media === 'string') {
      try { const parsed = JSON.parse(issue.media); if (Array.isArray(parsed)) return parsed; } catch (_) {}
    }
    return [];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarCitizen />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4">
          <FiArrowLeft className="mr-1" /> Back
        </button>
        {loading ? (
          <div className="flex items-center text-gray-600"><FiLoader className="animate-spin mr-2" /> Loading issue...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !issue ? (
          <div className="text-gray-600">Issue not found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between mb-4">
              {editMode ? (
                <input
                  className="text-2xl font-semibold text-gray-800 w-full border-b focus:outline-none" 
                  value={form.title}
                  onChange={(e)=>setForm(f=>({...f,title:e.target.value}))}
                />
              ) : (
                <h1 className="text-2xl font-semibold text-gray-800">{issue.title}</h1>
              )}
              <button
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                className="ml-4 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving || issue.status !== 'Reported'}
                title={issue.status !== 'Reported' ? 'Cannot edit after issue is in progress or resolved' : ''}
              >
                {saving ? <FiLoader className="animate-spin" /> : editMode ? (<><FiCheck className="mr-1" /> Save</>) : (<><FiEdit2 className="mr-1" /> Edit</>)}
              </button>
            </div>
            {editMode ? (
              <textarea
                className="w-full border rounded-md p-3 text-sm mb-4 focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={form.description}
                onChange={(e)=>setForm(f=>({...f,description:e.target.value}))}
              />
            ) : (
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{issue.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div><span className="font-medium text-gray-700">Status:</span>{' '}
                {editMode ? (
                  (user?.user_metadata?.user_type === 'government') ? (
                    <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="ml-1 border rounded px-2 py-1 text-sm">
                      {['Reported','In Progress','Resolved'].map(s=> <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className="ml-1 px-2 py-0.5 rounded bg-gray-200 text-gray-600" title="Citizens cannot change status">{issue.status}</span>
                  )
                ) : (
                  <span className="ml-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700">{issue.status}</span>
                )}
              </div>
              <div><span className="font-medium text-gray-700">Category:</span> <span>{issue.category || '—'}</span></div>
              <div><span className="font-medium text-gray-700">Created:</span> {new Date(issue.created_at).toLocaleString()}</div>
              {issue.updated_at && <div><span className="font-medium text-gray-700">Updated:</span> {new Date(issue.updated_at).toLocaleString()}</div>}
            </div>
            {mediaArray.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-3">Media</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mediaArray.map((m, idx) => (
                    <div key={idx} className="relative group rounded overflow-hidden bg-gray-100">
                      {m.type === 'video' ? (
                        <video src={m.url} controls className="w-full h-32 object-cover" />
                      ) : (
                        <img src={m.url} alt="issue media" className="w-full h-32 object-cover" loading="lazy" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mediaArray.length === 0 && <div className="text-sm text-gray-500">No media attached.</div>}
          </div>
        )}
      </div>
    </div>
  );
}