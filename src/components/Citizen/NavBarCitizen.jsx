import React, { useState } from "react";
import {
  FaHome,
  FaPlusCircle,
  FaListAlt,
  FaMapMarkedAlt,
  FaBell,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export default function NavBarCitizen() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md shadow-lg px-6 py-3 flex items-center justify-between relative z-50 rounded-2xl mb-6">
      {/* Logo */}
      <Link
        to="/citizen"
        className="flex items-center gap-2 text-blue-800 font-bold text-xl"
      >
        <FaHome className="text-blue-600" />
        Citizen Portal
      </Link>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-8 flex-1 mx-8">
        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-lg border border-gray-300">
          <input
            type="text"
            placeholder="Search your issues..."
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/citizen" className={`flex flex-col items-center ${isActive("/citizen")}`}>
            <FaHome size={18} />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/issuecard" className={`flex flex-col items-center ${isActive("/issuecard")}`}>
            <FaPlusCircle size={18} />
            <span className="text-xs">Report Issue</span>
          </Link>
          <Link to="/my-issues" className={`flex flex-col items-center ${isActive("/my-issues")}`}>
            <FaListAlt size={18} />
            <span className="text-xs">My Reports</span>
          </Link>
          <Link to="/map" className={`flex flex-col items-center ${isActive("/map")}`}>
            <FaMapMarkedAlt size={18} />
            <span className="text-xs">Map</span>
          </Link>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative cursor-pointer bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
          <FaBell className="text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            CU
          </div>
          <span className="hidden sm:block text-gray-700 font-medium">Citizen</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-gray-700"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileNavOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md py-4 px-6 rounded-b-2xl lg:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/citizen" onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-2 ${isActive("/citizen")}`}>
              <FaHome /> Dashboard
            </Link>
            <Link to="/report" onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-2 ${isActive("/report")}`}>
              <FaPlusCircle /> Report Issue
            </Link>
            <Link to="/my-issues" onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-2 ${isActive("/my-issues")}`}>
              <FaListAlt /> My Reports
            </Link>
            <Link to="/map" onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-2 ${isActive("/map")}`}>
              <FaMapMarkedAlt /> Map
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
