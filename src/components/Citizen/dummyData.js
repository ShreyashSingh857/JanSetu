// Dummy citizen data

export const issues = [
  {
    id: 1,
    title: "Pothole on Main Street",
    category: "Road Maintenance",
    status: "In Progress",
    date: "2025-09-05",
    location: "Main Street, Downtown",
    description: "Large pothole causing traffic issues",
    upvotes: 15,
    comments: 3,
    lat: 19.076,
    lng: 72.8777,
  },
  {
    id: 2,
    title: "Broken Street Light",
    category: "Electricity",
    status: "Reported",
    date: "2025-09-03",
    location: "Oak Avenue",
    description: "Street light not working for 3 days",
    upvotes: 8,
    comments: 1,
    lat: 19.1,
    lng: 72.88,
  },
  {
    id: 3,
    title: "Garbage Not Collected",
    category: "Sanitation",
    status: "Resolved",
    date: "2025-08-28",
    location: "Maple Road",
    description: "Garbage not picked up for a week",
    upvotes: 12,
    comments: 5,
    lat: 19.09,
    lng: 72.89,
  },
];

export const stats = {
  reported: 8,
  inProgress: 3,
  resolved: 5,
  upvotes: 35,
};

export const trendData = [
  { day: "Mon", reported: 2, resolved: 0 },
  { day: "Tue", reported: 1, resolved: 1 },
  { day: "Wed", reported: 3, resolved: 1 },
  { day: "Thu", reported: 1, resolved: 2 },
  { day: "Fri", reported: 1, resolved: 1 },
];
