// In-memory issue service (Supabase removed)
let _issues = [];

export async function listIssues({ status, category, search, reportedBy, assignedTo, from = 0, to = 24 }) {
  let data = [..._issues];
  if (status && status !== 'All') data = data.filter(i=>i.status===status);
  if (category && category !== 'All') data = data.filter(i=>i.category===category);
  if (search) data = data.filter(i=> (i.title||'').toLowerCase().includes(search.toLowerCase()) || (i.description||'').toLowerCase().includes(search.toLowerCase()));
  if (reportedBy) data = data.filter(i=>i.reported_by===reportedBy);
  if (assignedTo) data = data.filter(i=>i.assigned_to===assignedTo);
  data.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
  return data.slice(from, to+1);
}
export async function getIssue(id){ return _issues.find(i=>i.id===id)||null; }
export async function createIssue(payload){ const issue={ id:'issue-'+Date.now(), created_at:new Date().toISOString(), upvotes:0, media:[], ...payload}; _issues.push(issue); return issue; }
export async function updateIssue(id, updates){ const idx=_issues.findIndex(i=>i.id===id); if(idx>-1){ _issues[idx]={..._issues[idx],...updates}; return _issues[idx]; } return null; }
export async function toggleUpvote(issueId){ const issue=_issues.find(i=>i.id===issueId); if(issue){ issue.upvotes=(issue.upvotes||0)+1; } }
export async function createIssueWithMedia({ files = [], issueData }) { return createIssue({ ...issueData, media: [] }); }
