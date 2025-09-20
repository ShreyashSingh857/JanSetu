// src/App.jsx - Updated version without Firebase
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
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
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route component using Supabase auth context
const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing) return null; // or a spinner
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
        
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
        {/* Alias for backward/alternate mobile link */}
        <Route 
          path="/report" 
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
      </BrowserRouter>
    </AuthProvider>
  );
}