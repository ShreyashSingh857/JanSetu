import { useState } from "react";
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
} from "recharts";
import NavBarGov from "../components/Gov/NavBarGov";

// Sector data with short names for X-axis
const sectors = [
  { name: "Roads", shortName: "Roads", issues: 120, resolved: 80 },
  { name: "Water Supply", shortName: "Water", issues: 90, resolved: 70 },
  { name: "Electricity", shortName: "Electric", issues: 75, resolved: 60 },
  { name: "Sanitation", shortName: "Sanit.", issues: 110, resolved: 95 },
  { name: "Public Transport", shortName: "Transport", issues: 65, resolved: 50 },
];

export default function GovernmentDashboard() {
  const [activeSector, setActiveSector] = useState(sectors[0]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200">
      {/* Navbar */}
      <NavBarGov />

      <div className="p-6">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-blue-900 mb-6 text-center"
        >
          Government Dashboard
        </motion.h1>

        {/* Sector Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {sectors.map((sector, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSector(sector)}
              className={`px-6 py-2 rounded-xl shadow-md transition-all duration-300 ${
                activeSector.name === sector.name
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-100"
              }`}
            >
              {sector.name}
            </button>
          ))}
        </div>

        {/* Sector Details */}
        <motion.div
          key={activeSector.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          {/* Issues */}
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

          {/* Resolved */}
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

        {/* Bar Chart for All Sectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 max-w-5xl mx-auto"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Sector-wise Reported vs Resolved
          </h2>

          {/* Scrollable container for mobile */}
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
                    formatter={(value, name, props) => [value, name]}
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
      </div>
    </div>
  );
}
