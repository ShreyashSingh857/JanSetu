import React, { useState } from "react";
import {
  FaCity,
  FaSearch,
  FaMapMarkedAlt,
  FaExclamationCircle,
  FaTasks,
  FaChartLine,
  FaBell,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export default function NavBarGov() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // helper for active route
  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md shadow-lg px-6 py-3 flex items-center justify-between relative z-50 rounded-2xl mb-6">
      {/* Logo */}
      <Link
        to="/government"
        className="flex items-center gap-2 text-blue-800 font-bold text-xl"
      >
        <FaCity className="text-teal-500" />
        GovDashboard
      </Link>

      {/* Search + Options (Desktop) */}
      <div className="hidden lg:flex items-center gap-8 flex-1 mx-8">
        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-lg border border-gray-300">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search for issues, locations, departments..."
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>

        {/* Nav Options */}
        <div className="flex items-center gap-6">
          <Link to="/mapview" className={`flex flex-col items-center ${isActive("/mapview")}`}>
            <FaMapMarkedAlt size={18} />
            <span className="text-xs">Map View</span>
          </Link>
          <Link to="/issues" className={`flex flex-col items-center ${isActive("/issues")}`}>
            <FaExclamationCircle size={18} />
            <span className="text-xs">Reported Issues</span>
          </Link>
          <Link to="/progress" className={`flex flex-col items-center ${isActive("/progress")}`}>
            <FaTasks size={18} />
            <span className="text-xs">Progress</span>
          </Link>
          <Link to="/government" className={`flex flex-col items-center ${isActive("/government")}`}>
            <FaChartLine size={18} />
            <span className="text-xs">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative cursor-pointer bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
          <FaBell className="text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            5
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold">
            AD
          </div>
          <span className="hidden sm:block text-gray-700 font-medium">Admin</span>
        </div>

        {/* Mobile Menu Button */}
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
            <Link
              to="/mapview"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-2 ${isActive("/mapview")}`}
            >
              <FaMapMarkedAlt /> Map View
            </Link>
            <Link
              to="/issues"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-2 ${isActive("/issues")}`}
            >
              <FaExclamationCircle /> Reported Issues
            </Link>
            <Link
              to="/progress"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-2 ${isActive("/progress")}`}
            >
              <FaTasks /> Progress
            </Link>
            <Link
              to="/government"
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-2 ${isActive("/government")}`}
            >
              <FaChartLine /> Analytics
            </Link>
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
