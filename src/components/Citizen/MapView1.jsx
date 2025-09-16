import { MapContainer, TileLayer, useMap, LayersControl, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import 'leaflet.heat';
import NavBarCitizen from "./NavBarCitizen";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different issue types
const createCustomIcon = (category) => {
  const iconUrl = getIconForCategory(category);
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const getIconForCategory = (category) => {
  const icons = {
    'Roads': '🚧',
    'Water Supply': '💧',
    'Electricity': '⚡',
    'Sanitation': '🗑️',
    'Public Transport': '🚌'
  };
  const emoji = icons[category] || '📍';
  
  // Use encodeURIComponent instead of btoa for Unicode characters
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
      <circle cx="12.5" cy="12.5" r="12" fill="white" stroke="black" stroke-width="1"/>
      <text x="12.5" y="16" font-size="12" text-anchor="middle">${emoji}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

// Marker component for individual issues
const IssueMarker = ({ issue }) => {
  const map = useMap();
  
  const marker = useMemo(() => {
    const icon = createCustomIcon(issue.category);
    return L.marker([issue.lat, issue.lng], { icon });
  }, [issue]);
  
  useEffect(() => {
    marker.addTo(map);
    
    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold">${issue.title}</h3>
        <p class="text-sm">${issue.description}</p>
        <p class="text-xs mt-1">Status: ${issue.status}</p>
      </div>
    `);
    
    return () => {
      marker.remove();
    };
  }, [map, marker, issue]);
  
  return null;
};

// Heatmap layer component
const HeatmapLayer = ({ data, intensityType }) => {
  const map = useMap();
  
  useEffect(() => {
    // Remove existing heatmap layers
    map.eachLayer(layer => {
      if (layer instanceof L.HeatLayer) {
        map.removeLayer(layer);
      }
    });

    if (data.length === 0) return;

    const heatmapPoints = data.map(issue => {
      let intensity;
      
      if (intensityType === 'urgency') {
        intensity = issue.urgency === 'Critical' ? 1.0 : 
                   issue.urgency === 'High' ? 0.7 :
                   issue.urgency === 'Medium' ? 0.4 : 0.2;
      } else if (intensityType === 'status') {
        intensity = issue.status === 'Pending' ? 0.2 :
                   issue.status === 'In Progress' ? 0.5 : 0.8;
      } else if (intensityType === 'points') {
        intensity = Math.min(issue.points / 50, 1.0);
      }
      
      return [issue.lat, issue.lng, intensity];
    });

    if (L.heatLayer) {
      L.heatLayer(heatmapPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: 'blue',
          0.4: 'cyan',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);
    }

  }, [data, map, intensityType]);

  return null;
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

// Component to handle double-click events
const MapDoubleClickHandler = ({ onDoubleClick }) => {
  useMapEvents({
    dblclick: (e) => {
      onDoubleClick(e);
    }
  });
  return null;
};

// Filter controls component with collapsible feature
const MapFilters = ({ filters, setFilters, categories }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-3 bg-blue-500 text-white rounded-t-lg flex items-center justify-between hover:bg-blue-600 transition-colors"
      >
        <span className="font-semibold">Filter Issues</span>
        <span className="text-sm">{isCollapsed ? '▼' : '▲'}</span>
      </button>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Heatmap Intensity:</label>
              <select 
                value={filters.intensity} 
                onChange={(e) => setFilters({...filters, intensity: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="urgency">By Urgency</option>
                <option value="status">By Status</option>
                <option value="points">By Points</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dummy data
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
    intensity: 'urgency'
  });

  // Get unique categories from issues
  const categories = useMemo(() => [...new Set(issues.map(issue => issue.category))], []);

  // Filter issues based on selected filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      return (
        (filters.status === 'All' || issue.status === filters.status) &&
        (filters.category === 'All' || issue.category === filters.category)
      );
    });
  }, [filters]);

  // Handle double click to set location and redirect
  const handleMapDoubleClick = useCallback((e) => {
    const { lat, lng } = e.latlng;
    
    // Store the location in localStorage
    localStorage.setItem('issueLocation', JSON.stringify({
      lat,
      lng,
      address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
    }));
    
    // Redirect to issue reporting page
    window.location.href = '/issuecard';
  }, []);

  return (
    <div className="relative w-full h-screen">
      <NavBarCitizen />
      
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
        doubleClickZoom={false} // Disable default double-click zoom
      >
        <MapFilters 
          filters={filters} 
          setFilters={setFilters} 
          categories={categories} 
        />
        
        <MapDoubleClickHandler onDoubleClick={handleMapDoubleClick} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController issues={filteredIssues} />
        
        <HeatmapLayer data={filteredIssues} intensityType={filters.intensity} />
        
        {filteredIssues.map(issue => (
          <IssueMarker key={issue.id} issue={issue} />
        ))}
        
      </MapContainer>
      
      {/* Heatmap Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-2">Heatmap Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span className="text-sm">High Intensity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
            <span className="text-sm">Medium Intensity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 mr-2"></div>
            <span className="text-sm">Low Intensity</span>
          </div>
        </div>
      </div>

      {/* Double-click instruction */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm">
        Double-click on the map to report an issue at that location
      </div>
    </div>
  );
}