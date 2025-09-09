import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { progressData } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";

export default function IssueProgress() {
  const [status, setStatus] = useState("Pending");

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-green-200 p-6">
      <NavBarGov />
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-green-900 mb-6 text-center"
      >
        Update Issue Progress
      </motion.h1>

      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Update Status of Issue #101
        </h2>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <button className="w-full bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700">
          Save Progress
        </button>
      </div>

      {/* Progress Chart */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Issue Resolution Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="pending" stroke="#ef4444" name="Pending" />
            <Line type="monotone" dataKey="resolved" stroke="#22c55e" name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
