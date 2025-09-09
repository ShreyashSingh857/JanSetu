import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import { reportedIssues } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";
import { useState, useEffect, useMemo ,useRef} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different statuses
const createCustomIcon = (status) => {
  let color, icon;
  
  switch(status) {
    case "Resolved":
      color = "green";
      icon = "fa-check-circle";
      break;
    case "In Progress":
      color = "blue";
      icon = "fa-tools";
      break;
    case "Pending":
    default:
      color = "orange";
      icon = "fa-clock";
  }
  
  return L.divIcon({
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center bg-${color}-500 text-white border-2 border-white shadow-md">
             <i class="fas ${icon} text-sm"></i>
           </div>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Map controller component for fitting bounds and handling location
const MapController = ({ issues, userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    } else if (issues.length > 0) {
      const bounds = L.latLngBounds(issues.map(issue => [issue.lat, issue.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [issues, map, userLocation]);

  return null;
};

// Filter controls component
const MapFilters = ({ filters, setFilters, categories }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute top-16 left-4 z-[1000] bg-white rounded-lg shadow-md">
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-3 bg-blue-600 text-white rounded-t-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector:</label>
              <select 
                value={filters.sector} 
                onChange={(e) => setFilters({...filters, sector: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Sectors</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range:</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Legend component
const MapLegend = () => {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-800 mb-2">Status Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Resolved</span>
        </div>
      </div>
    </div>
  );
};

// Custom tile layer component to remove Leaflet attribution
const CustomTileLayer = ({ url, attribution }) => {
  const map = useMap();
  
  useEffect(() => {
    // Remove Leaflet attribution
    const leafletAttribution = document.querySelector('.leaflet-control-attribution');
    if (leafletAttribution) {
      leafletAttribution.remove();
    }
  }, [map]);
  
  return <TileLayer url={url} attribution={attribution} />;
};

export default function MapView() {
  const [filters, setFilters] = useState({
    status: "All",
    sector: "All",
    urgency: "All",
    dateRange: "all"
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef();

  // Get user's current location on component mount
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          setLocationError(error.message);
          setIsLocating(false);
          console.error("Error getting location:", error);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  // Get unique sectors from issues
  const sectors = useMemo(() => [...new Set(reportedIssues.map(issue => issue.sector))], []);

  // Filter issues based on selected filters
  const filteredIssues = useMemo(() => {
    return reportedIssues.filter(issue => {
      const statusMatch = filters.status === "All" || issue.status === filters.status;
      const sectorMatch = filters.sector === "All" || issue.sector === filters.sector;
      
      // For demo purposes, we'll assume all issues have medium urgency
      // In a real app, you would have an urgency field in your data
      const urgencyMatch = filters.urgency === "All" || "Medium" === filters.urgency;
      
      // Date filtering would require actual date objects in your data
      const dateMatch = true; // Simplified for demo
      
      return statusMatch && sectorMatch && urgencyMatch && dateMatch;
    });
  }, [filters]);

  // Stats for the info panel
  const stats = useMemo(() => {
    return {
      total: filteredIssues.length,
      pending: filteredIssues.filter(issue => issue.status === "Pending").length,
      inProgress: filteredIssues.filter(issue => issue.status === "In Progress").length,
      resolved: filteredIssues.filter(issue => issue.status === "Resolved").length,
    };
  }, [filteredIssues]);

  // Center map on user's location
  const centerToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBarGov />
      
      {/* Stats Panel */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden relative" style={{ height: '500px' }}>
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        >
          <MapFilters 
            filters={filters} 
            setFilters={setFilters} 
            categories={sectors} 
          />
          
          <MapController issues={filteredIssues} userLocation={userLocation} />
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard Map">
              <CustomTileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite View">
              <CustomTileLayer 
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {filteredIssues.map((issue) => (
            <Marker 
              key={issue.id} 
              position={[issue.lat, issue.lng]}
              icon={createCustomIcon(issue.status)}
            >
              <Popup>
                <div className="w-64">
                  <h3 className="font-semibold text-gray-800">{issue.sector}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>{issue.description}</p>
                    <p>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        issue.status === "Resolved" ? "bg-green-100 text-green-800" :
                        issue.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {issue.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Date:</span> {issue.date}</p>
                    <p><span className="font-medium">ID:</span> #{issue.id}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Add user location marker if available */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                html: `<div class="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500 text-white border-2 border-white shadow-md animate-pulse">
                         <i class="fas fa-user text-xs"></i>
                       </div>`,
                className: "user-location-marker",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            >
              <Popup>Your Location</Popup>
            </Marker>
          )}
        </MapContainer>
        
        <MapLegend />
        
        {/* Map Control Buttons - Moved to bottom left */}
        <div className="absolute bottom-4 left-4 z-[1000] flex space-x-2">
          <button 
            onClick={getUserLocation}
            className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors"
            title="Get my location"
          >
            <i className="fas fa-location-arrow text-gray-700"></i>
          </button>
          <button 
            onClick={centerToUserLocation}
            disabled={!userLocation}
            className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Center on my location"
          >
            <i className="fas fa-crosshairs text-gray-700"></i>
          </button>
          <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors">
            <i className="fas fa-download text-gray-700"></i>
          </button>
        </div>
        
        {/* Location status indicator */}
        {isLocating && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Locating...
          </div>
        )}
        
        {locationError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Location unavailable
          </div>
        )}
      </div>
    </div>
  );
}