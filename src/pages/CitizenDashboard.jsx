import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Citizen/NavBarCitizen";
import IssueCard from "../components/Citizen/IssueCard";
import MapView1 from "../components/Citizen/MapView1";
import { issues, stats, trendData } from "../components/Citizen/dummyData";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CitizenDashboard = () => {
  const [activeTab, setActiveTab] = useState("reported");

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-gray-900 mb-6 text-center"
        >
          Citizen Dashboard
        </motion.h1>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "Reported Issues", value: stats.reported, color: "blue" },
            { label: "In Progress", value: stats.inProgress, color: "yellow" },
            { label: "Resolved", value: stats.resolved, color: "green" },
            { label: "Total Upvotes", value: stats.upvotes, color: "purple" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white shadow-lg rounded-2xl p-6 flex items-center gap-4"
            >
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
              >
                <span className="text-2xl">●</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h2>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issues List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {["reported", "in progress", "resolved"].map((tab) => (
                    <button
                      key={tab}
                      className={`mr-8 py-4 px-1 text-sm font-medium border-b-2 ${
                        activeTab === tab
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "reported" && "Reported Issues"}
                      {tab === "in progress" && "In Progress"}
                      {tab === "resolved" && "Resolved"}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {issues
                  .filter(
                    (issue) =>
                      issue.status.toLowerCase() === activeTab.toLowerCase()
                  )
                  .map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}

                {issues.filter(
                  (issue) =>
                    issue.status.toLowerCase() === activeTab.toLowerCase()
                ).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No {activeTab} issues found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map & Trend Chart */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Issue Map
              </h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapView1 />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Issue Trends
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="#2563eb"
                    name="Reported"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#16a34a"
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
