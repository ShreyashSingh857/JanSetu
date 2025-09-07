// Fake sectors summary
export const sectors = [
  { name: "Roads", issues: 120, resolved: 80 },
  { name: "Water Supply", issues: 90, resolved: 70 },
  { name: "Electricity", issues: 75, resolved: 60 },
  { name: "Sanitation", issues: 110, resolved: 95 },
  { name: "Public Transport", issues: 65, resolved: 50 },
];

// Fake reported issues
export const reportedIssues = [
  {
    id: 1,
    sector: "Roads",
    description: "Pothole near bridge",
    status: "Pending",
    date: "2025-09-01",
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: 2,
    sector: "Water Supply",
    description: "Pipeline leakage near park",
    status: "In Progress",
    date: "2025-09-03",
    lat: 19.21,
    lng: 72.85,
  },
  {
    id: 3,
    sector: "Electricity",
    description: "Transformer failure in colony",
    status: "Resolved",
    date: "2025-09-05",
    lat: 19.1,
    lng: 72.9,
  },
];

// Fake issue progress trend
export const progressData = [
  { day: "Day 1", pending: 10, resolved: 2 },
  { day: "Day 2", pending: 8, resolved: 4 },
  { day: "Day 3", pending: 6, resolved: 7 },
  { day: "Day 4", pending: 4, resolved: 10 },
];
