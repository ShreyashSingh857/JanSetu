import { 
  FiSearch, FiCalendar, FiAlertCircle, 
  FiCheckCircle, FiClock, FiMapPin
} from 'react-icons/fi';
import { useState } from 'react';
import NavBarCitizen from './NavBarCitizen';

const MyReports = () => {
  // Sample data for demonstration
  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Pothole on Main Street',
      category: 'Roads',
      description: 'Large pothole near the intersection of Main and 5th Street',
      status: 'In Progress',
      date: '2023-10-15',
      location: 'Main Street',
      urgency: 'High',
      image: 'https://images.unsplash.com/photo-1542222123-01f495313c87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      points: 25
    },
    {
      id: 2,
      title: 'Broken Street Light',
      category: 'Electricity',
      description: 'Street light not working on Oak Avenue',
      status: 'Resolved',
      date: '2023-10-10',
      location: 'Oak Avenue',
      urgency: 'Medium',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      points: 20
    },
    {
      id: 3,
      title: 'Garbage Accumulation',
      category: 'Sanitation',
      description: 'Garbage has not been collected for 2 weeks in the downtown area',
      status: 'Pending',
      date: '2023-10-05',
      location: 'Downtown',
      urgency: 'High',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      points: 30
    },
    {
      id: 4,
      title: 'Water Leakage',
      category: 'Water Supply',
      description: 'Water leaking from a main pipe on Elm Street',
      status: 'In Progress',
      date: '2023-09-28',
      location: 'Elm Street',
      urgency: 'Critical',
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      points: 35
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    sortBy: 'date-desc'
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort reports based on user selection
  const filteredReports = reports
    .filter(report => {
      const matchesStatus = filters.status === 'All' || report.status === filters.status;
      const matchesCategory = filters.category === 'All' || report.category === filters.category;
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (filters.sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (filters.sortBy === 'urgency') {
        const urgencyOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return 0;
    });

  const statusIcons = {
    'Pending': <FiClock className="text-yellow-500" />,
    'In Progress': <FiAlertCircle className="text-blue-500" />,
    'Resolved': <FiCheckCircle className="text-green-500" />
  };

  const urgencyColors = {
    'Critical': 'bg-red-100 text-red-800',
    'High': 'bg-orange-100 text-orange-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
        <NavBarCitizen />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Reports</h1>
          <p className="text-gray-600">Track all the issues you've reported to the authorities</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="All">All Categories</option>
                <option value="Roads">Roads</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Public Transport">Public Transport</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="urgency">Urgency</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reports Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiAlertCircle className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.filter(r => r.status === 'Resolved').length}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FiClock className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-gray-800">
                {reports.reduce((total, report) => total + report.points, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <FiAlertCircle className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
              <p className="text-gray-500">Try changing your filters or search query</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredReports.map(report => (
                <li key={report.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <div className="w-32 h-24 rounded-md overflow-hidden">
                        <img 
                          src={report.image} 
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 truncate">
                          {report.title}
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          +{report.points} pts
                        </span>
                      </div>
                      
                      <p className="mt-1 text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColors[report.urgency]}`}>
                          {report.urgency}
                        </span>
                        
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <FiMapPin className="mr-1" />
                          {report.location}
                        </span>
                        
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <FiCalendar className="mr-1" />
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex-shrink-0 md:ml-6">
                      <div className="flex items-center">
                        <span className="mr-2">{statusIcons[report.status]}</span>
                        <span className={`text-sm font-medium ${
                          report.status === 'Resolved' ? 'text-green-600' :
                          report.status === 'In Progress' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View Details
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;