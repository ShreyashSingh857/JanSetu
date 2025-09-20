import { MapContainer, TileLayer, useMap, LayersControl, Marker, Popup, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import 'leaflet.heat';
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useIssues } from '../../hooks/useIssues';
import { useRealtimeIssues } from '../../hooks/useRealtimeIssues';
import NavBarCitizen from "./NavBarCitizen";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Category icon configuration
const CATEGORY_ICON_MAP = [
  { keys: ['road maintenance','roads','road'], emoji: '🚧', bg: '#fff7ed', ring: '#f97316' },
  { keys: ['sanitation','garbage','waste'], emoji: '🗑️', bg: '#f0fdf4', ring: '#16a34a' },
  { keys: ['electricity','power','lighting','street light','light'], emoji: '⚡', bg: '#fef2f2', ring: '#dc2626' },
  { keys: ['water supply','water','leak'], emoji: '💧', bg: '#eff6ff', ring: '#2563eb' },
  { keys: ['public transport','transport','bus'], emoji: '🚌', bg: '#f5f3ff', ring: '#7c3aed' },
  { keys: ['other'], emoji: '📍', bg: '#f3f4f6', ring: '#4b5563' }
];

function resolveCategoryIcon(categoryRaw) {
  const c = (categoryRaw || '').toLowerCase();
  return CATEGORY_ICON_MAP.find(cfg => cfg.keys.some(k => c.includes(k))) || CATEGORY_ICON_MAP[CATEGORY_ICON_MAP.length -1];
}

function createDivIcon(category) {
  const { emoji, bg, ring } = resolveCategoryIcon(category);
  const html = `
    <div style="
      width:34px;height:34px;border-radius:50%;
      background:${bg};
      border:2px solid ${ring};
      display:flex;align-items:center;justify-content:center;
      font-size:18px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.25));
    ">${emoji}</div>`;
  return L.divIcon({
    html,
    className: 'issue-category-icon',
    iconSize: [34,34],
    iconAnchor: [17,17],
    popupAnchor: [0,-16]
  });
}

// Marker component for individual issues
const IssueMarker = ({ issue }) => {
  const map = useMap();
  
  const marker = useMemo(() => {
    const icon = createDivIcon(issue.category);
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
  const layerRef = useRef(null);
  
  useEffect(() => {
    // Remove previous layer instance if present
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (data.length === 0) return;

    const rawPoints = data.map(issue => {
      let intensity;
      if (intensityType === 'urgency') {
        intensity = issue.urgency === 'Critical' ? 1.0 : issue.urgency === 'High' ? 0.75 : issue.urgency === 'Medium' ? 0.5 : 0.25;
      } else if (intensityType === 'status') {
        intensity = issue.status === 'Reported' || issue.status === 'Pending' ? 0.4 : issue.status === 'In Progress' ? 0.7 : 0.9;
      } else {
        // points mode
        const base = issue.points || 0;
        intensity = Math.min(base / 20, 1); // scale upvotes -> intensity
      }
      return [issue.lat, issue.lng, intensity];
    });

    if (L.heatLayer) {
      layerRef.current = L.heatLayer(rawPoints, {
        radius: 32,
        blur: 22,
        maxZoom: 18,
        minOpacity: 0.25,
        gradient: {
          0.0: '#1d4ed8',
          0.3: '#0ea5e9',
          0.5: '#10b981',
          0.7: '#f59e0b',
          0.85: '#dc2626',
          1.0: '#7f1d1d'
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

// Geocoding function to get address from coordinates
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    return `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
  } catch (error) {
    console.error("Geocoding error:", error);
    return `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
  }
};

// Map local status mapping if needed
const STATUS_MAP = {
  Pending: 'Reported'
};

export default function MapView() {
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    intensity: 'urgency'
  });
  const { data: issues = [], isLoading } = useIssues();
  useRealtimeIssues(true);

  // Get unique categories from issues
  const categories = useMemo(() => [...new Set(issues.map(issue => issue.category).filter(Boolean))], [issues]);

  // Filter issues based on selected filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const status = issue.status;
      return (
        (filters.status === 'All' || status === filters.status) &&
        (filters.category === 'All' || issue.category === filters.category)
      );
    }).map(i => ({
      id: i.id,
      title: i.title,
      category: i.category,
      description: i.description,
      status: i.status,
      date: i.created_at,
      lat: i.latitude || i.lat || 0,
      lng: i.longitude || i.lng || 0,
      location: i.location || 'Unknown',
      urgency: i.urgency || 'Medium',
      points: i.upvote_count || 0
    }));
  }, [filters, issues]);

  // Hide resolved issues from map/heatmap (they disappear once completed)
  const visibleIssues = useMemo(() => filteredIssues.filter(i => i.status !== 'Resolved'), [filteredIssues]);

  // Handle double click to set location and redirect
  const handleMapDoubleClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng;
    
    // Get address using geocoding
    const address = await reverseGeocode(lat, lng);
    
    // Store the location in localStorage
    localStorage.setItem('issueLocation', JSON.stringify({
      lat,
      lng,
      address: address
    }));
    
    // Check if we came from IssueCard
    const fromIssueCard = localStorage.getItem('fromIssueCard');
    if (fromIssueCard === 'true') {
      localStorage.removeItem('fromIssueCard');
      // Redirect back to issue reporting page
      window.location.href = '/issuecard';
    }
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
        
  {!isLoading && <MapController issues={visibleIssues} />}
        
  <HeatmapLayer data={visibleIssues} intensityType={filters.intensity} />
        
        {!isLoading && visibleIssues.map(issue => (
          <IssueMarker key={issue.id} issue={issue} />
        ))}
        {isLoading && (
          <div className="leaflet-top leaflet-right m-4 p-2 bg-white rounded shadow text-sm">Loading issues...</div>
        )}
        
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

      {/* Back button for IssueCard users */}
      {localStorage.getItem('fromIssueCard') === 'true' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-md shadow-md">
          <button
            onClick={() => {
              localStorage.removeItem('fromIssueCard');
              window.location.href = '/issuecard';
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Issue Form
          </button>
        </div>
      )}
    </div>
  );
}