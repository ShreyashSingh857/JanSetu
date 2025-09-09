import { motion } from "framer-motion";
import { reportedIssues } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";

export default function ReportedIssues() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-100 to-yellow-200 p-6">
      <NavBarGov />
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-yellow-900 mb-6 text-center"
      >
        Reported Issues
      </motion.h1>

      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Sector</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {reportedIssues.map((issue) => (
              <tr key={issue.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{issue.id}</td>
                <td className="px-4 py-2">{issue.sector}</td>
                <td className="px-4 py-2">{issue.description}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      issue.status === "Resolved"
                        ? "bg-green-200 text-green-700"
                        : issue.status === "In Progress"
                        ? "bg-yellow-200 text-yellow-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-2">{issue.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
