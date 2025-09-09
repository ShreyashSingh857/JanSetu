import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion } from "framer-motion";
import { reportedIssues } from "../../data/fakeData";
import NavBarGov from "../Gov/NavBarGov";

export default function MapView() {
  return (
    
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-purple-200 p-6">
      <NavBarGov />
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-purple-900 mb-6 text-center"
      >
        Map View
      </motion.h1>

      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={12}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {reportedIssues.map((issue) => (
            <Marker key={issue.id} position={[issue.lat, issue.lng]}>
              <Popup>
                <strong>{issue.sector}</strong> <br />
                {issue.description} <br />
                Status: {issue.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
