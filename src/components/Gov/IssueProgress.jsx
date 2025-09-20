import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useIssues } from "../../hooks/useIssues";
import { useUpdateIssueProgress } from "../../hooks/useUpdateIssueProgress";
import NavBarGov from "../Gov/NavBarGov";

const COLORS = ['#4C6FFF', '#43D2FF', '#43D2FF', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  'Resolved': '#10B981',
  'In Progress': '#3B82F6',
  'Pending': '#F59E0B',
  'Could Not Be Fixed': '#EF4444'
};

export default function IssueProgress() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [stageTemp, setStageTemp] = useState(1);
  const [statusTemp, setStatusTemp] = useState('Pending');
  const [notesTemp, setNotesTemp] = useState('');
  const { data: issues = [], isLoading, error } = useIssues({});
  const updateMutation = useUpdateIssueProgress();

  const normalizedIssues = useMemo(() => {
    return (issues || []).map(i => ({
      id: i.id,
      category: i.category,
      status: i.status,
      description: i.description || i.title || '',
      created_at: i.created_at,
      date: new Date(i.created_at).toLocaleDateString(),
      progress_stage: i.progress_stage || 1,
      progress_notes: i.progress_notes || '',
      progress_history: i.progress_history || [],
      resolved_at: i.resolved_at || null
    }));
  }, [issues]);

  const statusCounts = useMemo(() => {
    const counts = { 'Resolved': 0, 'In Progress': 0, 'Pending': 0, 'Reported': 0 };
    normalizedIssues.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });
    return counts;
  }, [normalizedIssues]);

  const statusDistribution = useMemo(() => (
    Object.entries(statusCounts)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  ), [statusCounts]);

  const categoryData = useMemo(() => {
    const map = new Map();
    normalizedIssues.forEach(i => {
      const key = i.category || 'Uncategorized';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [normalizedIssues]);

  const totalIssues = normalizedIssues.length;
  const resolvedIssues = normalizedIssues.filter(i => i.status === 'Resolved').length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  const weeklyTrend = useMemo(() => {
    const today = new Date();
    const buckets = [];
    for (let d = 6; d >= 0; d--) {
      const day = new Date(today);
      day.setHours(0,0,0,0);
      day.setDate(today.getDate() - d);
      const endOfDay = new Date(day); endOfDay.setHours(23,59,59,999);
      const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const createdUpTo = normalizedIssues.filter(i => new Date(i.created_at) <= endOfDay);
      const resolvedByDay = createdUpTo.filter(i => i.status === 'Resolved' && i.resolved_at && new Date(i.resolved_at) <= endOfDay).length;
      const pending = createdUpTo.length - resolvedByDay;
      buckets.push({ day: label, resolved: resolvedByDay, pending });
    }
    return buckets;
  }, [normalizedIssues]);

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setStageTemp(issue.progress_stage || 1);
    setStatusTemp(issue.status || (issue.status === 'Reported' ? 'Reported' : 'Pending'));
    setNotesTemp(issue.progress_notes || '');
  };

  // Ensure stage jumps to 5 when status set to Resolved for consistency
  if (statusTemp === 'Resolved' && stageTemp < 5) {
    // Synchronous adjustment when user picks Resolved
    // (Avoid setState during render by using microtask)
    queueMicrotask(() => setStageTemp(5));
  }

  function handleSave() {
    if (!selectedIssue) return;
    const apiStatus = statusTemp === 'Reported' ? 'Pending' : statusTemp; // map to DB-recognized value
    updateMutation.mutate(
      { id: selectedIssue.id, stage: stageTemp, status: apiStatus, notes: notesTemp },
      {
        onSuccess: (data) => {
          setSelectedIssue(prev => prev ? { ...prev, progress_stage: data.progress_stage, status: data.status, progress_notes: data.progress_notes, progress_history: data.progress_history, resolved_at: data.resolved_at } : prev);
        },
        onError: (err) => {
          // surface full error in console for debugging
          // eslint-disable-next-line no-console
          console.error('Progress save error', err);
        }
      }
    );
  }

  // Recreate original five progress stages with dynamic status markers
  const progressStages = useMemo(() => {
    if (!selectedIssue) return [];
    const stage = stageTemp || selectedIssue.progress_stage || 1; // use temp for live preview
    return [
      { id:1, title:'Issue Reported', desc:'Citizen has reported the issue', status:'completed', date: new Date(selectedIssue.created_at).toLocaleString() },
      { id:2, title:'Issue Acknowledged', desc:'Government acknowledged the issue', status: stage >=2 ? (stage===2? 'active':'completed'):'pending', date: stage>=2 ? new Date(selectedIssue.created_at).toLocaleString() : 'Pending' },
      { id:3, title:'Assigned to Department', desc:'Issue assigned to department', status: stage>3 ? 'completed' : stage===3 ? 'active':'pending', date: stage>=3 ? new Date(selectedIssue.created_at).toLocaleString() : 'Pending' },
      { id:4, title:'Work In Progress', desc:'Work has started', status: stage>4 ? 'completed' : stage===4 ? 'active':'pending', date: stage>=4 ? new Date(selectedIssue.created_at).toLocaleString() : 'Pending' },
      { id:5, title:'Work Completed', desc:'Issue resolved', status: stage===5 ? 'active':'pending', date: stage===5 && selectedIssue.resolved_at ? new Date(selectedIssue.resolved_at).toLocaleString() : (stage===5 ? 'Pending timestamp' : 'Pending') }
    ];
  }, [selectedIssue, stageTemp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <NavBarGov />
      
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Issue Progress Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and manage reported issues from citizens</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Issues</h3>
                <p className="text-2xl font-bold text-gray-800">{totalIssues}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Resolved Issues</h3>
                <p className="text-2xl font-bold text-gray-800">{resolvedIssues}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Resolution Rate</h3>
                <p className="text-2xl font-bold text-gray-800">{resolutionRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Issue Selection */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Select Issue to Inspect</h2>
            <span className="text-sm text-gray-500">{isLoading ? 'Loading...' : `${totalIssues} issues`}</span>
          </div>
          {error && <div className="text-sm text-red-600 mb-2">Failed to load issues.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalizedIssues.slice(0, 6).map(issue => (
              <motion.div key={issue.id} whileHover={{ y: -4 }} onClick={() => handleIssueSelect(issue)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedIssue?.id===issue.id? 'border-blue-500 bg-blue-50 shadow-md':'border-gray-200 hover:border-blue-300'}`}> 
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">#{issue.id} - {issue.category}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{issue.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 truncate">{issue.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-500">{issue.date}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">—</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedIssue && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-white shadow-lg rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">Issue #{selectedIssue.id} - {selectedIssue.category}</h2>
                <p className="text-gray-600 mt-2 max-w-xl">{selectedIssue.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <span>Reported: {selectedIssue.date}</span>
                  <span>Current Stage: {selectedIssue.progress_stage || 1} {selectedIssue.progress_stage !== stageTemp && `(→ ${stageTemp})`}</span>
                  <span>Current Status: {selectedIssue.status} {selectedIssue.status !== statusTemp && `(→ ${statusTemp})`}</span>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Progress Timeline</h3>
                  <div className="relative">
                    {/* Vertical connector line positioned behind circles */}
                    <div className="absolute left-4 top-4 bottom-4 w-px bg-blue-100 z-0"></div>
                    <div className="space-y-6">
                      {progressStages.map(st => (
                        <div key={st.id} className="flex items-start relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mr-4 relative z-10 shadow ${st.status==='completed' ? 'bg-green-500 text-white' : st.status==='active' ? 'bg-blue-500 text-white animate-pulse':'bg-gray-300 text-gray-600'}`}>{st.status==='completed' ? '✓' : st.id}</div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${st.status==='completed' ? 'text-green-700' : st.status==='active' ? 'text-blue-700':'text-gray-600'}`}>{st.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{st.desc}</div>
                            <div className="text-xs text-gray-400 mt-1">{st.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Update Progress</h3>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
                  <div className="grid grid-cols-5 gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setStageTemp(s)} className={`py-2 rounded text-xs font-medium ${stageTemp===s? 'bg-blue-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={statusTemp} onChange={e=>setStatusTemp(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="Reported">Reported</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea value={notesTemp} onChange={e=>setNotesTemp(e.target.value)} placeholder="Add notes..." className="w-full border rounded px-3 py-2 text-sm h-24 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={updateMutation.isLoading || !selectedIssue || (stageTemp===selectedIssue.progress_stage && statusTemp===selectedIssue.status && notesTemp===selectedIssue.progress_notes)} className="flex-1 bg-blue-600 disabled:opacity-60 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">{updateMutation.isLoading ? 'Saving...' : 'Save Update'}</button>
                  <button onClick={()=>handleIssueSelect(selectedIssue)} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50">Reset</button>
                </div>
                {updateMutation.isError && <div className="text-xs text-red-600 mt-2">Failed to save: {updateMutation.error?.message || 'Unknown error'}{updateMutation.error?.message?.includes('No rows updated') ? ' (RLS policy may be blocking UPDATE or issue id mismatch)' : ''}</div>}
                {updateMutation.isSuccess && <div className="text-xs text-green-600 mt-2">Saved.</div>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Progress Chart */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Weekly Resolution Trend
              </h2>
              <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Issues by Category
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#4C6FFF" name="Issues" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {normalizedIssues.slice(0, 3).map((issue, index) => (
              <div key={index} className="flex items-center p-3 border-b border-gray-100 last:border-0">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  issue.status === "Resolved" ? "bg-green-500" :
                  issue.status === "In Progress" ? "bg-blue-500" : "bg-yellow-500"
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Issue #{issue.id} - {issue.category}</p>
                  <p className="text-xs text-gray-500">Reported {issue.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  issue.status === "Resolved" ? "bg-green-100 text-green-800" :
                  issue.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}