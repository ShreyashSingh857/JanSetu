import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import NavBarGov from "../components/Gov/NavBarGov";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function GovernmentDashboard() {
  const [sectors, setSectors] = useState([]);
  const [activeSector, setActiveSector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [priorityIssues, setPriorityIssues] = useState([]);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, you would fetch from your API
        const sectorData = [
          { name: "Roads", shortName: "Roads", issues: 120, resolved: 80 },
          { name: "Water Supply", shortName: "Water", issues: 90, resolved: 70 },
          { name: "Electricity", shortName: "Electric", issues: 75, resolved: 60 },
          { name: "Sanitation", shortName: "Sanit.", issues: 110, resolved: 95 },
          { name: "Public Transport", shortName: "Transport", issues: 65, resolved: 50 },
        ];
        
        setSectors(sectorData);
        setActiveSector(sectorData[0]);
        
        // Simulate priority issues
        setPriorityIssues([
          { id: 1, title: "Major water pipeline leak", sector: "Water Supply", daysOpen: 5 },
          { id: 2, title: "Bridge structural damage", sector: "Roads", daysOpen: 3 },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const totalIssues = sectors.reduce((sum, sector) => sum + sector.issues, 0);
  const totalResolved = sectors.reduce((sum, sector) => sum + sector.resolved, 0);
  const overallResolutionRate = Math.round((totalResolved / totalIssues) * 100);
  
  const resolutionRateData = sectors.map(sector => ({
    name: sector.shortName,
    value: Math.round((sector.resolved / sector.issues) * 100)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200">
      <NavBarGov />
      <div className="p-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-blue-900 mb-6 text-center"
        >
          Government Dashboard
        </motion.h1>

        {/* Time Filter */}
        <div className="flex justify-end mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            {['7d', '30d', '90d', 'ytd'].map(period => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeFilter === period 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{totalIssues}</div>
            <div className="text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{totalResolved}</div>
            <div className="text-gray-600">Resolved Issues</div>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{overallResolutionRate}%</div>
            <div className="text-gray-600">Resolution Rate</div>
          </div>
        </div>

        {/* Sector Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sectors.map((sector, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSector(sector)}
              className={`px-3 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-xl shadow-md transition-all duration-300 ${
                activeSector.name === sector.name
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-100"
              }`}
            >
              {sector.name}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Sector Details */}
            {activeSector && (
              <motion.div
                key={activeSector.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-blue-800 mb-3">
                    {activeSector.name} Issues
                  </h2>
                  <p className="text-4xl font-bold text-blue-700">
                    {activeSector.issues}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Total reports submitted by citizens
                  </p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-green-700 mb-3">
                    Resolved
                  </h2>
                  <p className="text-4xl font-bold text-green-600">
                    {activeSector.resolved}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Successfully resolved by authorities
                  </p>
                </div>
              </motion.div>
            )}

            {/* Priority Issues */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                High Priority Issues
              </h3>
              <div className="space-y-3">
                {priorityIssues.slice(0, 5).map(issue => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm text-gray-600">{issue.sector}</div>
                    </div>
                    <div className="text-red-600 font-medium">
                      {issue.daysOpen} days
                    </div>
                  </div>
                ))}
                {priorityIssues.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No high priority issues
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Bar Chart for All Sectors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Sector-wise Reported vs Resolved
              </h2>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[500px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectors}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => {
                          const fullSector = sectors.find(
                            (s) => s.shortName === label
                          );
                          return fullSector ? fullSector.name : label;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="issues" fill="#2563eb" name="Reported Issues" />
                      <Bar dataKey="resolved" fill="#16a34a" name="Resolved Issues" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Resolution Rate Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Resolution Rate by Sector (%)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={resolutionRateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {resolutionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}