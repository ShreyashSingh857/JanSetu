import Login from "./pages/Login";
import Home from "./pages/Home";
import CitizenDashboard from "./pages/CitizenDashboard";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import MapView from "./components/Gov/MapView";
import ReportedIssues from "./components/Gov/ReportedIssues";
import IssueProgress from "./components/Gov/IssueProgress";
import IssueCard from "./components/Citizen/IssueCard";
import MapView1 from "./components/Citizen/MapView1";
import Myreport from "./components/Citizen/Myreport";
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/government" element={<GovernmentDashboard />} />
        <Route path="/mapview" element={<MapView />} />
        <Route path="/issues" element={<ReportedIssues />} />
        <Route path="/progress" element={<IssueProgress />} />
        <Route path="/issuecard" element={<IssueCard />} />
        <Route path="/map" element={<MapView1 />} />
        <Route path="/my-issues" element={<Myreport />} />

        {/* fallback route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-2xl text-red-600">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
