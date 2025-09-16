import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import NavBarCitizen from "../components/Citizen/NavBarCitizen";

// Status colors for consistency
const STATUS_COLORS = {
  Reported: "#3b82f6", // blue
  "In Progress": "#f59e0b", // amber
  Resolved: "#10b981", // emerald
};

const CitizenDashboard = () => {
  const [activeTab, setActiveTab] = useState("Reported");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample data for demonstration
  const [issues, setIssues] = useState([
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
    },
  ]);

  const [stats, setStats] = useState({
    reported: 8,
    inProgress: 3,
    resolved: 5,
    upvotes: 35,
  });

  const [trendData, setTrendData] = useState([
    { day: "Mon", reported: 2, resolved: 0 },
    { day: "Tue", reported: 1, resolved: 1 },
    { day: "Wed", reported: 3, resolved: 1 },
    { day: "Thu", reported: 1, resolved: 2 },
    { day: "Fri", reported: 1, resolved: 1 },
  ]);

  // Filter options for issues
  const filterOptions = ["All", "MIDC", "MIDC Test", "Clandysia", "Chandysia", "Adagus"];

  // Calculate status distribution for pie chart
  const statusDistribution = [
    { name: "Reported", value: stats.reported, color: STATUS_COLORS.Reported },
    { name: "In Progress", value: stats.inProgress, color: STATUS_COLORS["In Progress"] },
    { name: "Resolved", value: stats.resolved, color: STATUS_COLORS.Resolved },
  ];

  // Radar chart data for issue categories
  const categoryData = [
    { subject: 'Infrastructure', A: 120, fullMark: 150 },
    { subject: 'Sanitation', A: 98, fullMark: 150 },
    { subject: 'Safety', A: 86, fullMark: 150 },
    { subject: 'Transport', A: 99, fullMark: 150 },
    { subject: 'Utilities', A: 85, fullMark: 150 },
    { subject: 'Environment', A: 65, fullMark: 150 },
  ];

  // IssueDisplayCard component
  const IssueDisplayCard = ({ issue }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "Resolved":
          return "bg-green-100 text-green-800";
        case "In Progress":
          return "bg-blue-100 text-blue-800";
        case "Reported":
        default:
          return "bg-yellow-100 text-yellow-800";
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{issue.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
            {issue.status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-3">{issue.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            <span className="font-medium">Location:</span> {issue.location}
          </div>
          <div>
            <span className="font-medium">Date:</span> {issue.date}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-blue-500 mr-1">👍</span>
              <span>{issue.upvotes}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">💬</span>
              <span>{issue.comments}</span>
            </div>
          </div>
          
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
            {issue.category}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      <NavBarCitizen />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-gray-900"
            >
              Citizen Dashboard
            </motion.h1>
            <p className="text-gray-600 mt-2">Monitor and track reported community issues in real-time</p>
          </div>
          <button className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center">
            <span className="mr-2">+</span> Report New Issue
          </button>
        </div>

        {/* Stats Cards with Glassmorphism Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {[
            { label: "Reported Issues", value: stats.reported, color: "blue", icon: "📝", trend: "+12%" },
            { label: "In Progress", value: stats.inProgress, color: "amber", icon: "🔄", trend: "+5%" },
            { label: "Resolved", value: stats.resolved, color: "emerald", icon: "✅", trend: "+8%" },
            { label: "Community Impact", value: stats.upvotes, color: "purple", icon: "👍", trend: "+15%" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50 relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </h2>
                  <span className={`text-xs font-medium text-${stat.color}-600 mt-2 inline-block`}>
                    {stat.trend} from last week
                  </span>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600 text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="xl:col-span-1 space-y-6">
            {/* Status Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} issues`, 'Count']}
                      contentStyle={{ 
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {statusDistribution.map((status, idx) => (
                  <div key={idx} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-xs text-gray-600">{status.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Category Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Categories</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="Issues" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Issues List */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 h-full flex flex-col"
            >
              {/* Tab navigation */}
              <div className="border-b border-gray-200/50">
                <nav className="flex">
                  {["Reported", "In Progress", "Resolved"].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 py-4 px-4 text-sm font-medium text-center border-b-2 transition-all ${
                        activeTab === tab
                          ? `border-${tab === "Reported" ? "blue" : tab === "In Progress" ? "amber" : "emerald"}-500 text-gray-900`
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab} <span className="ml-1 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">{issues.filter(issue => issue.status === tab).length}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Filter bar */}
              <div className="p-4 border-b border-gray-200/50 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Filter:</span>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white/50"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    {filterOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issues list */}
              <div className="p-4 flex-grow overflow-auto">
                {issues
                  .filter((issue) => issue.status === activeTab && 
                          (selectedFilter === "All" || issue.location === selectedFilter))
                  .map((issue) => (
                    <IssueDisplayCard key={issue.id} issue={issue} />
                  ))}

                {issues.filter((issue) => issue.status === activeTab && 
                  (selectedFilter === "All" || issue.location === selectedFilter)).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="mb-2 font-medium">No {activeTab.toLowerCase()} issues found</p>
                    <p className="text-sm">Try changing your filters or report a new issue</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Trends */}
          <div className="xl:col-span-1 space-y-6">
            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                      }}
                    />
                    <Area type="monotone" dataKey="reported" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <span className="text-2xl mb-2">📝</span>
                  <span className="text-sm font-medium">Report Issue</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <span className="text-2xl mb-2">🗺️</span>
                  <span className="text-sm font-medium">View Map</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                  <span className="text-2xl mb-2">📊</span>
                  <span className="text-sm font-medium">Statistics</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <span className="text-2xl mb-2">👥</span>
                  <span className="text-sm font-medium">Community</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;