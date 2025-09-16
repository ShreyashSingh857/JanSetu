import { MapContainer, TileLayer, useMap, LayersControl, Marker, Popup } from "react-leaflet";
import { reportedIssues } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Heatmap layer component
const HeatmapLayer = ({ data, intensityType }) => {
  const map = useMap();
  
  useEffect(() => {
    map.eachLayer(layer => {
      if (layer.options && layer.options.heatmap) {
        map.removeLayer(layer);
      }
    });

    const heatmapPoints = data.map(issue => {
      let intensity = 0.2;
      
      if (intensityType === 'status') {
        intensity = issue.status === "Resolved" ? 0.2 : 
                   issue.status === "In Progress" ? 0.5 : 0.8;
      } else if (intensityType === 'urgency') {
        intensity = issue.urgency === "Critical" ? 1.0 : 
                   issue.urgency === "High" ? 0.7 :
                   issue.urgency === "Medium" ? 0.4 : 0.2;
      } else if (intensityType === 'sector') {
        const sectorIntensities = {
          'Roads': 0.8,
          'Water Supply': 0.6,
          'Electricity': 0.7,
          'Sanitation': 0.9,
          'Public Transport': 0.5
        };
        intensity = sectorIntensities[issue.sector] || 0.3;
      }
      
      return [issue.lat, issue.lng, intensity];
    });

    if (window.L && window.L.heatLayer) {
      const heatmap = L.heatLayer(heatmapPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 16,
        gradient: {
          0.2: 'blue',
          0.4: 'cyan',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);
      
      heatmap.options.heatmap = true;
    }

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Heatmap Type:</label>
              <select 
                value={filters.intensity} 
                onChange={(e) => setFilters({...filters, intensity: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="status">By Status</option>
                <option value="urgency">By Urgency</option>
                <option value="sector">By Sector</option>
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
        { color: 'red', label: 'Pending Issues' },
        { color: 'yellow', label: 'In Progress' },
        { color: 'blue', label: 'Resolved' }
      ];
    } else if (intensityType === 'urgency') {
      return [
        { color: 'red', label: 'Critical' },
        { color: 'yellow', label: 'High' },
        { color: 'lime', label: 'Medium' },
        { color: 'blue', label: 'Low' }
      ];
    } else {
      return [
        { color: 'red', label: 'High Priority Sectors' },
        { color: 'yellow', label: 'Medium Priority' },
        { color: 'blue', label: 'Low Priority' }
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

  const sectors = useMemo(() => [...new Set(reportedIssues.map(issue => issue.sector))], []);

  const filteredIssues = useMemo(() => {
    return reportedIssues.filter(issue => {
      const statusMatch = filters.status === "All" || issue.status === filters.status;
      const sectorMatch = filters.sector === "All" || issue.sector === filters.sector;
      return statusMatch && sectorMatch;
    });
  }, [filters]);

  const stats = useMemo(() => {
    return {
      total: filteredIssues.length,
      pending: filteredIssues.filter(issue => issue.status === "Pending").length,
      inProgress: filteredIssues.filter(issue => issue.status === "In Progress").length,
      resolved: filteredIssues.filter(issue => issue.status === "Resolved").length,
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
          
          <HeatmapLayer data={filteredIssues} intensityType={filters.intensity} />
          
          {filteredIssues.map(issue => (
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