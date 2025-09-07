import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useMemo } from "react";
import NavBarCitizen from "./NavBarCitizen";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different statuses
const createCustomIcon = (status) => {
  let className = '';
  let iconClass = '';

  switch(status) {
    case 'Resolved':
      className = 'bg-green-500 border-green-600';
      iconClass = 'fas fa-check-circle';
      break;
    case 'In Progress':
      className = 'bg-blue-500 border-blue-600';
      iconClass = 'fas fa-tools';
      break;
    case 'Pending':
    default:
      className = 'bg-yellow-500 border-yellow-600';
      iconClass = 'fas fa-clock';
  }

  return L.divIcon({
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center text-white ${className} border-2 shadow-md"><i class="${iconClass} text-sm"></i></div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Map controller component for fitting bounds
const MapController = ({ issues }) => {
  const map = useMap();
  
  useEffect(() => {
    if (issues.length > 0) {
      const bounds = L.latLngBounds(issues.map(issue => [issue.lat, issue.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [issues, map]);

  return null;
};

// Filter controls component with collapsible feature
const MapFilters = ({ filters, setFilters, categories }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md">
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-3 bg-blue-500 text-white rounded-t-lg flex items-center justify-between hover:bg-blue-600 transition-colors"
      >
        <span className="font-semibold">Filter Issues</span>
        <i className={`fas ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-sm`}></i>
      </button>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-4 max-w-xs">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category:</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency:</label>
              <select 
                value={filters.urgency} 
                onChange={(e) => setFilters({...filters, urgency: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Urgency Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dummy data (replace with your actual data source)
const issues = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    category: 'Roads',
    description: 'Large pothole near the intersection of Main and 5th Street',
    status: 'In Progress',
    date: '2023-10-15',
    lat: 19.0760,
    lng: 72.8777,
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
    lat: 19.0860,
    lng: 72.8877,
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
    lat: 19.0660,
    lng: 72.8677,
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
    lat: 19.0765,
    lng: 72.8670,
    location: 'Elm Street',
    urgency: 'Critical',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    points: 35
  },
  {
    id: 5,
    title: 'Damaged Sidewalk',
    category: 'Roads',
    description: 'Cracked and uneven sidewalk posing tripping hazard',
    status: 'Pending',
    date: '2023-10-01',
    lat: 19.0720,
    lng: 72.8820,
    location: 'Park Avenue',
    urgency: 'Medium',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    points: 22
  }
];

export default function MapView() {
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    urgency: 'All'
  });

  // Get unique categories from issues
  const categories = useMemo(() => [...new Set(issues.map(issue => issue.category))], []);

  // Filter issues based on selected filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      return (
        (filters.status === 'All' || issue.status === filters.status) &&
        (filters.category === 'All' || issue.category === filters.category) &&
        (filters.urgency === 'All' || issue.urgency === filters.urgency)
      );
    });
  }, [filters]);

  return (
    <div className="relative w-full h-screen">
      <NavBarCitizen />
      
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapFilters 
          filters={filters} 
          setFilters={setFilters} 
          categories={categories} 
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController issues={filteredIssues} />
        
        {/* Render individual markers for each issue */}
        {filteredIssues.map(issue => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={createCustomIcon(issue.status)}
          >
            <Popup>
              <div className="w-64">
                <h3 className="font-semibold text-gray-800">{issue.title}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Category:</span> {issue.category}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Urgency:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      issue.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                      issue.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                      issue.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.urgency}
                    </span>
                  </p>
                  <p><span className="font-medium">Reported:</span> {new Date(issue.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Location:</span> {issue.location}</p>
                </div>
                {issue.image && (
                  <div className="mt-2">
                    <img src={issue.image} alt={issue.title} className="w-full h-32 object-cover rounded-md" />
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-600">{issue.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    +{issue.points} pts
                  </span>
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}