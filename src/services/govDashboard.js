import { supabase } from '../lib/supabase';

// Map or normalize category labels into sector buckets for consistent display
function normalizeCategory(raw) {
  if (!raw) return 'Other';
  const c = raw.toLowerCase();
  if (c.includes('road')) return 'Roads';
  if (c.includes('water')) return 'Water Supply';
  if (c.includes('electric') || c.includes('power')) return 'Electricity';
  if (c.includes('sanit') || c.includes('waste') || c.includes('garbage')) return 'Sanitation';
  if (c.includes('transport') || c.includes('bus')) return 'Public Transport';
  return raw; // Keep original if no mapping
}

export async function fetchGovernmentDashboard() {
  if (!supabase) throw new Error('Supabase client not configured');
  // Pull essential fields. If urgency/priority fields exist later, include them.
  const { data: issues, error } = await supabase
    .from('issues')
    .select('id, title, status, category, created_at, updated_at');
  if (error) throw error;
  if (!issues) return { sectors: [], priorityIssues: [], trend: null, comparison: null };

  // Derive sector stats
  const sectorMap = new Map();
  issues.forEach(i => {
    const sector = normalizeCategory(i.category);
    if (!sectorMap.has(sector)) sectorMap.set(sector, { name: sector, issues: 0, resolved: 0 });
    const rec = sectorMap.get(sector);
    rec.issues += 1;
    if (i.status === 'Resolved') rec.resolved += 1;
  });
  const sectors = Array.from(sectorMap.values()).sort((a,b) => b.issues - a.issues);

  // Priority issues: oldest non-resolved sorted by age desc (limit 5)
  const now = Date.now();
  const OPEN_STATUSES = ['Reported','In Progress'];
  const priorityIssues = issues
    .filter(i => OPEN_STATUSES.includes(i.status))
    .map(i => ({
      id: i.id,
      title: i.title,
      sector: normalizeCategory(i.category),
      daysOpen: Math.max(1, Math.round((now - new Date(i.created_at).getTime()) / 86400000))
    }))
    .sort((a,b) => b.daysOpen - a.daysOpen)
    .slice(0,5);

  // Monthly trend for last 6 months (including current)
  const trendBuckets = []; // [{month: 'Jan', reported: n, resolved: n}]
  const trendIndex = new Map();
  const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
  const start = new Date();
  start.setMonth(start.getMonth() - 5); // 5 months back
  start.setDate(1); // beginning of month
  for (let m = 0; m < 6; m++) {
    const d = new Date(start.getFullYear(), start.getMonth() + m, 1);
    const label = monthFormatter.format(d);
    const bucket = { label, reported: 0, resolved: 0 };
    trendBuckets.push(bucket);
    trendIndex.set(d.getFullYear() + '-' + d.getMonth(), bucket);
  }
  issues.forEach(i => {
    const created = new Date(i.created_at);
    const key = created.getFullYear() + '-' + created.getMonth();
    const bucket = trendIndex.get(key);
    if (bucket) {
      bucket.reported += 1;
      if (i.status === 'Resolved') bucket.resolved += 1; // approximate
    }
  });
  const trend = {
    labels: trendBuckets.map(b => b.label),
    datasets: [
      {
        label: 'Reported Issues',
        data: trendBuckets.map(b => b.reported),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: 2
      },
      {
        label: 'Resolved Issues',
        data: trendBuckets.map(b => b.resolved),
        borderColor: 'rgba(46, 204, 113, 1)',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.3,
        fill: true,
        borderWidth: 2
      }
    ]
  };

  // Sector comparison chart dataset
  const comparison = {
    labels: sectors.map(s => s.name),
    datasets: [
      {
        label: 'Reported Issues',
        data: sectors.map(s => s.issues),
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1
      },
      {
        label: 'Resolved Issues',
        data: sectors.map(s => s.resolved),
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 1
      }
    ]
  };

  return { sectors, priorityIssues, trend, comparison };
}
