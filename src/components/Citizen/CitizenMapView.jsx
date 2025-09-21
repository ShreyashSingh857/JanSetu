// Renamed from MapView1.jsx for clarity
// Includes optimized heatmap layer with shallow data hashing to avoid unnecessary re-renders.
import { MapContainer, TileLayer, useMap, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useIssues } from '../../hooks/useIssues';
import { useRealtimeIssues } from '../../hooks/useRealtimeIssues';
import NavBarCitizen from './NavBarCitizen';

// Marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

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
  return L.divIcon({
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${bg};border:2px solid ${ring};display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.25));">${emoji}</div>`,
    className: 'issue-category-icon', iconSize: [34,34], iconAnchor: [17,17], popupAnchor: [0,-16]
  });
}
const IssueMarker = ({ issue }) => {
  const map = useMap();
  const marker = useMemo(() => L.marker([issue.lat, issue.lng], { icon: createDivIcon(issue.category) }), [issue]);
  useEffect(() => {
    marker.addTo(map);
    marker.bindPopup(`<div class="p-2"><h3 class="font-semibold">${issue.title}</h3><p class="text-sm">${issue.description}</p><p class="text-xs mt-1">Status: ${issue.status}</p></div>`);
    return () => marker.remove();
  }, [map, marker, issue]);
  return null;
};

// Shallow hash util for heat points
function hashPoints(points) {
  let h = 0; for (let i=0;i<points.length;i++) { const p = points[i]; h = (h*31 + ((p[0]*1000)|0))|0; h = (h*31 + ((p[1]*1000)|0))|0; h = (h*31 + ((p[2]*100)|0))|0; }
  return h;
}

const HeatmapLayer = ({ data, intensityType }) => {
  const map = useMap();
  const layerRef = useRef(null);
  const lastHashRef = useRef(null);
  useEffect(() => {
    if (!data.length) { if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; } return; }
    const raw = data.map(issue => {
      let intensity;
      if (intensityType === 'urgency') intensity = issue.urgency === 'Critical' ? 1.0 : issue.urgency === 'High' ? 0.75 : issue.urgency === 'Medium' ? 0.5 : 0.25;
      else if (intensityType === 'status') intensity = (issue.status === 'Reported' || issue.status === 'Pending') ? 0.4 : issue.status === 'In Progress' ? 0.7 : 0.9;
      else { const base = issue.points || 0; intensity = Math.min(base/20, 1); }
      return [issue.lat, issue.lng, intensity];
    });
    const currentHash = hashPoints(raw);
    if (currentHash === lastHashRef.current && layerRef.current) return; // no change
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    layerRef.current = L.heatLayer(raw, { radius:32, blur:22, maxZoom:18, minOpacity:0.25, gradient:{0.0:'#1d4ed8',0.3:'#0ea5e9',0.5:'#10b981',0.7:'#f59e0b',0.85:'#dc2626',1.0:'#7f1d1d'} }).addTo(map);
    lastHashRef.current = currentHash;
  }, [data, map, intensityType]);
  return null;
};

const MapController = ({ issues }) => {
  const map = useMap();
  useEffect(() => {
    if (issues.length) {
      map.fitBounds(L.latLngBounds(issues.map(i => [i.lat, i.lng])), { padding:[50,50] });
    }
  }, [issues, map]);
  return null;
};

const MapDoubleClickHandler = ({ onDoubleClick }) => { useMapEvents({ dblclick: onDoubleClick }); return null; };

const reverseGeocode = async (lat,lng) => {
  try { const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`); const d = await r.json(); return d?.display_name || `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`; } catch { return `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`; }
};

export default function CitizenMapView() {
  const [filters, setFilters] = useState({ status:'All', category:'All', intensity:'urgency' });
  const { data: issues = [], isLoading } = useIssues();
  useRealtimeIssues(true);
  const categories = useMemo(() => [...new Set(issues.map(i => i.category).filter(Boolean))], [issues]);
  const filteredIssues = useMemo(() => issues.filter(issue => (
    (filters.status==='All'||issue.status===filters.status) && (filters.category==='All'||issue.category===filters.category)
  )).map(i => ({
    id:i.id,title:i.title,category:i.category,description:i.description,status:i.status,date:i.created_at,lat:i.latitude||i.lat||0,lng:i.longitude||i.lng||0,location:i.location||'Unknown',urgency:i.urgency||'Medium',points:i.upvote_count||0
  })), [filters, issues]);
  const visibleIssues = useMemo(() => filteredIssues.filter(i => i.status !== 'Resolved'), [filteredIssues]);

  const handleMapDoubleClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng; const address = await reverseGeocode(lat,lng);
    localStorage.setItem('issueLocation', JSON.stringify({ lat,lng,address }));
    if (localStorage.getItem('fromIssueCard') === 'true') { localStorage.removeItem('fromIssueCard'); window.location.href='/issuecard'; }
  }, []);

  return (
    <div className="relative w-full h-screen">
      <NavBarCitizen />
      <MapContainer center={[19.076,72.8777]} zoom={12} className="w-full h-full" zoomControl doubleClickZoom={false}>
        <MapDoubleClickHandler onDoubleClick={handleMapDoubleClick} />
        <TileLayer attribution='&copy; OpenStreetMap contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {!isLoading && <MapController issues={visibleIssues} />}
        <HeatmapLayer data={visibleIssues} intensityType={filters.intensity} />
        {!isLoading && visibleIssues.map(issue => <IssueMarker key={issue.id} issue={issue} />)}
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-800 mb-2">Heatmap Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center"><div className="w-4 h-4 bg-red-500 mr-2"/><span className="text-sm">High Intensity</span></div>
          <div className="flex items-center"><div className="w-4 h-4 bg-yellow-500 mr-2"/><span className="text-sm">Medium Intensity</span></div>
          <div className="flex items-center"><div className="w-4 h-4 bg-blue-500 mr-2"/><span className="text-sm">Low Intensity</span></div>
        </div>
      </div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm">Double-click on the map to report an issue</div>
    </div>
  );
}
