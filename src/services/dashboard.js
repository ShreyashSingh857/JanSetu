import { supabase } from '../lib/supabase';

// Fetch aggregated dashboard data
export async function fetchDashboardData() {
  if (!supabase) throw new Error('Supabase client not configured');

  // Pull necessary fields (status, category, created_at, id)
  const { data: issues, error } = await supabase
    .from('issues')
    .select('id, status, category, created_at');
  if (error) throw error;

  if (!issues) return { stats: {}, statusDistribution: [], categoryCounts: [], weekly: [] };

  // Upvotes aggregation (count per issue)
  const issueIds = issues.map(i => i.id);
  let upvoteCount = 0;
  if (issueIds.length) {
    const { count, error: upErr } = await supabase
      .from('issue_upvotes')
      .select('issue_id', { count: 'exact', head: true })
      .in('issue_id', issueIds);
    if (!upErr && typeof count === 'number') upvoteCount = count;
  }

  const reported = issues.filter(i => i.status === 'Reported').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  // Status distribution for pie
  const statusDistribution = [
    { name: 'Reported', value: reported },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved }
  ];

  // Category counts for radar chart
  const categoryCounter = issues.reduce((acc, i) => {
    const c = i.category || 'Other';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const maxCat = Math.max(1, ...Object.values(categoryCounter));
  const categoryCounts = Object.entries(categoryCounter).map(([subject, count]) => ({ subject, A: count, fullMark: maxCat }));

  // Weekly trend: bucket issues created per weekday; resolved maybe tracked by status change timestamp (not stored), so we approximate resolved count by creation day of resolved issues.
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 6 * 24 * 3600 * 1000); // last 7 days
  const daily = {};
  weekdays.forEach(d => { daily[d] = { reported: 0, resolved: 0 }; });
  issues.forEach(i => {
    const created = new Date(i.created_at);
    if (created >= weekAgo) {
      const day = weekdays[created.getDay()];
      daily[day].reported += 1;
      if (i.status === 'Resolved') daily[day].resolved += 1; // approximation
    }
  });
  // Order full week Monday-Sunday for chart
  const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weekly = order.map(day => ({ day, reported: daily[day]?.reported || 0, resolved: daily[day]?.resolved || 0 }));

  return {
    stats: { reported, inProgress, resolved, upvotes: upvoteCount },
    statusDistribution,
    categoryCounts,
    weekly
  };
}