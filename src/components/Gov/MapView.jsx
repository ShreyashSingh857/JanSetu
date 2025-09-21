import { MapContainer, TileLayer, useMap, LayersControl, Marker, Popup } from "react-leaflet";
// import { reportedIssues } from "../../data/fakeData"; // replaced by live data
import { useIssues } from '../../hooks/useIssues';
import { useRealtimeIssues } from '../../hooks/useRealtimeIssues';
import NavBarGov from "../Gov/NavBarGov";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import L from 'leaflet';
import 'leaflet.heat';
import "leaflet/dist/leaflet.css";
import { normalizeStatus } from '../../lib/status';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to safely encode SVG strings
const encodeSvg = (svgString) => {
  return encodeURIComponent(svgString)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
};

// Normalize raw category values into sector buckets
function normalizeCategory(raw) {
  if (!raw) return 'Other';
  const c = raw.toLowerCase();
  if (c.includes('road')) return 'Roads';
  if (c.includes('water')) return 'Water Supply';
  if (c.includes('electric') || c.includes('power') || c.includes('light')) return 'Electricity';
  if (c.includes('sanit') || c.includes('garbage') || c.includes('waste')) return 'Sanitation';
  if (c.includes('transport') || c.includes('bus')) return 'Public Transport';
  return raw;
}

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
  
  // Use encoded SVG instead of base64 to avoid encoding issues
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
      <circle cx="12.5" cy="12.5" r="12" fill="white" stroke="black" stroke-width="1"/>
      <text x="12.5" y="16" font-size="12" text-anchor="middle">${emoji}</text>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeSvg(svgString)}`;
};

// Marker component for individual issues
const IssueMarker = ({ issue }) => {
  const map = useMap();
  
  const marker = useMemo(() => {
    const icon = createCustomIcon(issue.sector);
    return L.marker([issue.lat, issue.lng], { icon });
  }, [issue]);
  
  useEffect(() => {
    marker.addTo(map);
    
    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold">${issue.sector}</h3>
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

// Hash utility for heatmap point arrays
function hashPoints(points) { let h=0; for (let i=0;i<points.length;i++){const p=points[i]; h=(h*31+((p[0]*1000)|0))|0; h=(h*31+((p[1]*1000)|0))|0; h=(h*31+((p[2]*100)|0))|0;} return h; }
const HeatmapLayer = ({ data, intensityType }) => {
  const map = useMap();
  const layerRef = React.useRef(null);
  const lastHashRef = React.useRef(null);
  useEffect(() => {
    if (!data.length) { if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current=null; } return; }
    const pts = data.map(issue => {
      let intensity;
      if (intensityType==='urgency') intensity = issue.urgency === 'Critical' ? 1.0 : issue.urgency === 'High' ? 0.75 : issue.urgency === 'Medium' ? 0.5 : 0.25;
      else if (intensityType==='status') intensity = (issue.status==='Reported'||issue.status==='Pending') ? 0.4 : issue.status==='In Progress' ? 0.7 : 0.9;
      else { const base = issue.points||0; intensity = Math.min(base/20,1); if (intensity===0) intensity=0.15; }
      return [issue.lat, issue.lng, intensity];
    });
    const h = hashPoints(pts);
    if (h === lastHashRef.current && layerRef.current) return; // unchanged
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current=null; }
    layerRef.current = L.heatLayer(pts, { radius:32, blur:22, maxZoom:18, minOpacity:0.25, gradient:{0.0:'#1d4ed8',0.3:'#0ea5e9',0.5:'#10b981',0.7:'#f59e0b',0.85:'#dc2626',1.0:'#7f1d1d'} }).addTo(map);
    layerRef.current.options.heatmap = true;
    lastHashRef.current = h;
  }, [data, intensityType, map]);
  return null;
};

// Map controller component
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-3 bg-blue-600 text-white rounded-t-lg flex items-center justify-between hover:bg-blue-700 transition-colors"
      >
        <span className="font-semibold">Heatmap Settings</span>
        <i className={`fas ${isCollapsed ? 'fa-chevron-up' : 'fa-chevron-down'} text-sm`}></i>
      </button>

      {!isCollapsed && (
        <div className="p-4 max-w-xs">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heatmap Intensity:</label>
              <select 
                value={filters.intensity} 
                onChange={(e) => setFilters({...filters, intensity: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="urgency">By Urgency</option>
                <option value="status">By Status</option>
                <option value="points">By Upvotes</option>
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
          </div>
        </div>
      )}
    </div>
  );
};

// Legend component
const MapLegend = ({ intensityType }) => {
  const getLegendItems = () => {
    if (intensityType === 'status') {
      return [
        { color: '#1d4ed8', label: 'Reported/Pending' },
        { color: '#f59e0b', label: 'In Progress' },
        { color: '#dc2626', label: 'Resolved' }
      ];
    } else if (intensityType === 'urgency') {
      return [
        { color: '#dc2626', label: 'Critical' },
        { color: '#f59e0b', label: 'High' },
        { color: '#10b981', label: 'Medium' },
        { color: '#0ea5e9', label: 'Low' }
      ];
    } else { // points
      return [
        { color: '#7f1d1d', label: 'Very High Upvotes' },
        { color: '#dc2626', label: 'High' },
        { color: '#f59e0b', label: 'Moderate' },
        { color: '#10b981', label: 'Low' },
        { color: '#1d4ed8', label: 'Few / None' }
      ];
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-800 mb-2">Heatmap Legend</h3>
      <div className="space-y-2">
        {getLegendItems().map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-4 h-4 mr-2" 
              style={{ backgroundColor: item.color === 'lime' ? 'lime' : item.color }}
            ></div>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom tile layer component
const CustomTileLayer = ({ url, attribution }) => {
  const map = useMap();
  
  useEffect(() => {
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
    intensity: "status"
  });

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef();

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
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  const { data: liveIssues = [], isLoading } = useIssues();
  useRealtimeIssues(true);

  // Adapt live issues to expected shape (lat/lng fields may be latitude/longitude)
  const adaptedIssues = useMemo(() => {
    return liveIssues.map(i => ({
      id: i.id,
      sector: normalizeCategory(i.category),
      description: i.description,
      status: i.status,
      urgency: i.urgency || 'Medium',
      points: i.upvote_count || 0,
      lat: i.latitude || i.lat || 0,
      lng: i.longitude || i.lng || 0
    })).filter(i => i.lat && i.lng);
  }, [liveIssues]);

  const sectors = useMemo(() => [...new Set(adaptedIssues.map(issue => issue.sector))], [adaptedIssues]);

  const filteredIssues = useMemo(() => {
    return adaptedIssues.filter(issue => {
      const statusMatch = filters.status === "All" || issue.status === filters.status;
      const sectorMatch = filters.sector === "All" || issue.sector === filters.sector;
      return statusMatch && sectorMatch;
    });
  }, [filters, adaptedIssues]);

  // Resolved issues should disappear from map/heatmap (unless explicitly needed later)
  const visibleIssues = useMemo(() => filteredIssues.filter(i => i.status !== 'Resolved'), [filteredIssues]);

  const stats = useMemo(() => {
    return {
      total: filteredIssues.length,
      pending: filteredIssues.filter(issue => normalizeStatus(issue.status) === 'Pending').length,
      inProgress: filteredIssues.filter(issue => normalizeStatus(issue.status) === 'In Progress').length,
      resolved: filteredIssues.filter(issue => normalizeStatus(issue.status) === 'Resolved').length,
    };
  }, [filteredIssues]);

  const centerToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <NavBarGov />
      
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
          
          {!isLoading && <HeatmapLayer data={visibleIssues} intensityType={filters.intensity} />}
          
          {!isLoading && visibleIssues.map(issue => (
            <IssueMarker key={issue.id} issue={issue} />
          ))}
          
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
          {isLoading && (
            <div className="leaflet-top leaflet-right m-4 p-2 bg-white rounded shadow text-sm">Loading issues...</div>
          )}
        </MapContainer>
        
        <MapLegend intensityType={filters.intensity} />
        
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
        </div>
        
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