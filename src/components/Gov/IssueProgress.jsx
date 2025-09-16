import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { progressData, reportedIssues } from "../../data/fakeData";
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
  const [status, setStatus] = useState("Pending");
  const [currentStage, setCurrentStage] = useState(2);
  const [notes, setNotes] = useState("");

  // Timeline data for different issue types
  const progressStages = [
    {
      id: 1,
      title: "Issue Reported",
      description: "Citizen has reported the issue",
      status: "completed",
      date: "2025-09-10 10:30 AM",
    },
    {
      id: 2,
      title: "Issue Acknowledged",
      description: "Government has acknowledged the issue",
      status: "completed",
      date: "2025-09-10 11:45 AM",
    },
    {
      id: 3,
      title: "Assigned to Department",
      description: "Issue assigned to Road Maintenance Department",
      status: currentStage >= 3 ? "completed" : currentStage === 3 ? "active" : "pending",
      date: currentStage >= 3 ? "2025-09-10 02:15 PM" : "Pending",
    },
    {
      id: 4,
      title: "Work In Progress",
      description: "Workers have begun addressing the issue",
      status: currentStage >= 4 ? "completed" : currentStage === 4 ? "active" : "pending",
      date: currentStage >= 4 ? "2025-09-11 09:30 AM" : "Pending",
    },
    {
      id: 5,
      title: "Work Completed",
      description: "Issue has been resolved",
      status: currentStage >= 5 ? "completed" : currentStage === 5 ? "active" : "pending",
      date: currentStage >= 5 ? "2025-09-12 03:45 PM" : "Pending",
    },
  ];

  // Function to handle stage updates
  const updateStage = (newStage) => {
    setCurrentStage(newStage);
    // Update status based on stage
    if (newStage === 5) setStatus("Resolved");
    else if (newStage >= 3) setStatus("In Progress");
    else setStatus("Pending");
  };

  // Function to handle issue selection
  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    // Reset stage based on issue status
    if (issue.status === "Resolved") {
      setCurrentStage(5);
      setStatus("Resolved");
    } else if (issue.status === "In Progress") {
      setCurrentStage(4);
      setStatus("In Progress");
    } else {
      setCurrentStage(2);
      setStatus("Pending");
    }
  };

  // Function to handle saving progress
  const handleSaveProgress = () => {
    // In a real app, this would send data to an API
    alert(`Progress updated to stage ${currentStage} with status: ${status}`);
  };

  // Prepare data for charts
  const statusDistribution = [
    { name: 'Resolved', value: reportedIssues.filter(issue => issue.status === 'Resolved').length },
    { name: 'In Progress', value: reportedIssues.filter(issue => issue.status === 'In Progress').length },
    { name: 'Pending', value: reportedIssues.filter(issue => issue.status === 'Pending').length },
  ];

  const categoryDistribution = reportedIssues.reduce((acc, issue) => {
    const category = issue.sector;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate metrics for dashboard
  const totalIssues = reportedIssues.length;
  const resolvedIssues = reportedIssues.filter(issue => issue.status === 'Resolved').length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

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
            <h2 className="text-xl font-semibold text-gray-800">Select Issue to Track</h2>
            <span className="text-sm text-gray-500">{reportedIssues.length} issues reported</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportedIssues.slice(0, 6).map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ y: -5 }}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedIssue?.id === issue.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleIssueSelect(issue)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">#{issue.id} - {issue.sector}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    issue.status === "Resolved" 
                      ? "bg-green-100 text-green-800" 
                      : issue.status === "In Progress" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {issue.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 truncate">{issue.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-500">{issue.date}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">{issue.priority || "Medium"}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Issues →
            </button>
          </div>
        </div>

        {selectedIssue ? (
          <>
            {/* Issue Summary Card */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white shadow-lg rounded-2xl p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 mr-3">
                      {selectedIssue.sector} - Issue #{selectedIssue.id}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === "Resolved" ? "bg-green-100 text-green-800" :
                      status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      status === "Could Not Be Fixed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {selectedIssue.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">Reported:</span>
                      <span className="text-sm text-gray-600 ml-2">{selectedIssue.date}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">Location:</span>
                      <span className="text-sm text-gray-600 ml-2">{selectedIssue.location || "City Center"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">Priority:</span>
                      <span className="text-sm text-gray-600 ml-2">{selectedIssue.priority || "Medium"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Share Update
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress Timeline */}
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Progress Timeline</h2>
                
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-blue-100"></div>
                  
                  <div className="space-y-8">
                    {progressStages.map((stage, index) => (
                      <motion.div 
                        key={stage.id} 
                        className="relative flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          stage.status === "completed" ? "bg-green-500 shadow-md" :
                          stage.status === "active" ? "bg-blue-500 shadow-md animate-pulse" : "bg-gray-300"
                        }`}>
                          {stage.status === "completed" ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <span className="text-white font-bold">{stage.id}</span>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className={`text-sm font-medium ${
                            stage.status === "completed" ? "text-green-700" :
                            stage.status === "active" ? "text-blue-700" : "text-gray-500"
                          }`}>
                            {stage.title}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                          <div className="text-xs text-gray-500 mt-2">{stage.date}</div>
                          
                          {/* Show additional info for active stage */}
                          {stage.status === "active" && stage.id === 4 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-700">
                                <span className="font-medium">Workers on site:</span> 3-person crew
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                <span className="font-medium">Estimated completion:</span> Tomorrow, 3:00 PM
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                <span className="font-medium">Supervisor:</span> John Smith (555-1234)
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Issue resolution failed section */}
                {status === "Could Not Be Fixed" && (
                  <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-red-800 font-medium flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Issue Resolution Failed
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      The issue could not be resolved due to adverse weather conditions. 
                      Work will resume when conditions improve.
                    </p>
                    <div className="mt-3 flex space-x-2">
                      <button className="text-sm text-red-800 font-medium hover:underline">
                        View detailed report
                      </button>
                      <button className="text-sm text-red-800 font-medium hover:underline">
                        Reschedule work
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Update Progress Section */}
              <div className="space-y-6">
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Update Progress Status
                  </h2>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Stage
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {progressStages.map(stage => (
                        <button
                          key={stage.id}
                          onClick={() => updateStage(stage.id)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center ${
                            currentStage === stage.id
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {stage.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Could Not Be Fixed">Could Not Be Fixed</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Add any additional information about the progress..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition-colors font-medium"
                      onClick={handleSaveProgress}
                    >
                      Save Progress Update
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Status Distribution Chart */}
                <div className="bg-white shadow-lg rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Issues by Status
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow-lg rounded-2xl p-8 text-center"
          >
            <div className="text-gray-400 mb-4 text-6xl">📋</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Select an Issue</h3>
            <p className="text-gray-500">Choose an issue from the list above to view and update its progress</p>
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
              <BarChart data={progressData}>
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
            {reportedIssues.slice(0, 3).map((issue, index) => (
              <div key={index} className="flex items-center p-3 border-b border-gray-100 last:border-0">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  issue.status === "Resolved" ? "bg-green-500" :
                  issue.status === "In Progress" ? "bg-blue-500" : "bg-yellow-500"
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Issue #{issue.id} - {issue.sector}</p>
                  <p className="text-xs text-gray-500">Updated {issue.date}</p>
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