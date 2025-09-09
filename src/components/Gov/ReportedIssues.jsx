import { useState } from "react";
import { motion } from "framer-motion";
import { reportedIssues } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";
import { FiSearch, FiFilter, FiDownload, FiEye, FiEdit } from "react-icons/fi";

export default function ReportedIssues() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  // Filter issues based on search and filter criteria
  const filteredIssues = reportedIssues.filter((issue) => {
    const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    const matchesSector = sectorFilter === "All" || issue.sector === sectorFilter;
    
    return matchesSearch && matchesStatus && matchesSector;
  });

  // Get unique sectors for filter dropdown
  const sectors = [...new Set(reportedIssues.map(issue => issue.sector))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBarGov />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reported Issues</h1>
          <p className="text-gray-600">Manage and track all reported civic issues</p>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by ID, description, or sector..."
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Sector Filter */}
            <div>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Sectors</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {filteredIssues.length} of {reportedIssues.length} issues
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <FiDownload className="text-gray-500" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Reported
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{issue.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {issue.sector}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {issue.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          issue.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : issue.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FiEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No issues found</div>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination (optional - can be implemented later) */}
        <div className="mt-6 flex justify-between items-center bg-white px-6 py-3 rounded-xl shadow-sm">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredIssues.length}</span> of{' '}
            <span className="font-medium">{filteredIssues.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
              Previous
            </button>
            <button className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}