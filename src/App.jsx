// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import CitizenDashboard from './pages/CitizenDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import MapView from './components/Gov/MapView';
import ReportedIssues from './components/Gov/ReportedIssues';
import IssueProgress from './components/Gov/IssueProgress';
import IssueCard from './components/Citizen/IssueCard';
import MapView1 from './components/Citizen/MapView1';
import Myreport from './components/Citizen/Myreport';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Component to handle routing based on authentication
function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/citizen" />} />
      
      {/* Citizen Routes */}
      <Route 
        path="/citizen" 
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/issuecard" 
        element={
          <ProtectedRoute>
            <IssueCard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <MapView1 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-issues" 
        element={
          <ProtectedRoute>
            <Myreport />
          </ProtectedRoute>
        } 
      />
      
      {/* Government Routes */}
      <Route 
        path="/government" 
        element={
          <ProtectedRoute>
            <GovernmentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mapview" 
        element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/issues" 
        element={
          <ProtectedRoute>
            <ReportedIssues />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/progress" 
        element={
          <ProtectedRoute>
            <IssueProgress />
          </ProtectedRoute>
        } 
      />
      
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}