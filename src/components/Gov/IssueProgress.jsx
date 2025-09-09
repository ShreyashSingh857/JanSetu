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
  Cell
} from "recharts";
import { progressData, reportedIssues } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function IssueProgress() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [currentStage, setCurrentStage] = useState(2); // For demo purposes

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-6">
      <NavBarGov />
      
      <div className="max-w-6xl mx-auto">
        {/* Issue Selection */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Issue to Track</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportedIssues.slice(0, 6).map((issue) => (
              <div
                key={issue.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedIssue?.id === issue.id
                    ? 'border-blue-500 bg-blue-50'
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
                <p className="text-xs text-gray-500 mt-2">{issue.date}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedIssue ? (
          <>
            {/* Issue Summary Card */}
            <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {selectedIssue.sector} - Issue #{selectedIssue.id}
                  </h2>
                  <p className="text-gray-600">
                    {selectedIssue.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-gray-700">Reported:</span>
                    <span className="text-sm text-gray-600 ml-2">{selectedIssue.date}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === "Resolved" ? "bg-green-100 text-green-800" :
                    status === "In Progress" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress Timeline */}
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Progress Timeline</h2>
                
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-green-200"></div>
                  
                  <div className="space-y-8">
                    {progressStages.map((stage, index) => (
                      <div key={stage.id} className="relative flex items-start">
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          stage.status === "completed" ? "bg-green-500" :
                          stage.status === "active" ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                        }`}>
                          {stage.status === "completed" ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <span className="text-xs font-bold text-white">{stage.id}</span>
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
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Issue resolution failed section */}
                {status === "Could Not Be Fixed" && (
                  <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="text-red-800 font-medium">Issue Resolution Failed</h3>
                    <p className="text-sm text-red-700 mt-1">
                      The issue could not be resolved due to adverse weather conditions. 
                      Work will resume when conditions improve.
                    </p>
                    <button className="mt-3 text-sm text-red-800 font-medium hover:underline">
                      View detailed report
                    </button>
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
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4, 5].map(stage => (
                        <button
                          key={stage}
                          onClick={() => updateStage(stage)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium ${
                            currentStage === stage
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Stage {stage}
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
                    ></textarea>
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition-colors">
                    Save Progress Update
                  </button>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="text-gray-400 mb-4 text-6xl">📋</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Select an Issue</h3>
            <p className="text-gray-500">Choose an issue from the list above to view and update its progress</p>
          </div>
        )}

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Progress Chart */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Weekly Resolution Trend
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="resolved" fill="#16a34a" name="Resolved" />
                <Bar dataKey="pending" fill="#ef4444" name="Pending" />
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" name="Issues" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}