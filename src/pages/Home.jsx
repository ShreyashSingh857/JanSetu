import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaUsers, 
  FaChartLine, 
  FaMapMarkedAlt, 
  FaExclamationCircle, 
  FaAward,
  FaBell,
  FaGlobe,
  FaMobileAlt,
  FaShieldAlt,
  FaStar,
  FaArrowRight
} from "react-icons/fa";

// Import your logo (make sure the path is correct)
import logo from "../assets/jansetunew.png";

export default function Home() {
  const [stats, setStats] = useState({
    issuesResolved: 1250,
    activeUsers: 5400,
    govtDepartments: 12,
    avgResponseTime: "18h"
  });

  // Animation for counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        issuesResolved: prev.issuesResolved + Math.floor(Math.random() * 5),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar - Improved Design */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="JanSetu Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-blue-800">JanSetu</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-blue-50"
              >
                Login
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Bridging <span className="text-blue-600">Citizens</span> & <span className="text-green-600">Government</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A unified platform for citizens to report issues and for government bodies to efficiently address them with transparency and accountability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Get Started <FaArrowRight />
                </Link>
                <Link 
                  to="/login" 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  Citizen Login
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:w-1/2 flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <img src={logo} alt="JanSetu Logo" className="h-8 w-auto" />
                      <span className="font-bold text-gray-800">JanSetu</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live</span>
                  </div>
                  <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                      alt="Community connection" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.issuesResolved}+</div>
                      <div className="text-xs text-gray-500">Issues Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.activeUsers}+</div>
                      <div className="text-xs text-gray-500">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.govtDepartments}</div>
                      <div className="text-xs text-gray-500">Departments</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 bg-blue-200 blur-xl opacity-50 rounded-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.issuesResolved}+</div>
              <div className="text-gray-600">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.activeUsers}+</div>
              <div className="text-gray-600">Active Citizens</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.govtDepartments}</div>
              <div className="text-gray-600">Government Departments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.avgResponseTime}</div>
              <div className="text-gray-600">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform connects citizens and government through a seamless process of issue reporting, tracking, and resolution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Citizen Features */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-md"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Citizens</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <FaExclamationCircle className="text-blue-600 mt-1" />
                  <span>Report issues with photos/videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaMapMarkedAlt className="text-blue-600 mt-1" />
                  <span>Pinpoint location on interactive map</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBell className="text-blue-600 mt-1" />
                  <span>Real-time status updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaAward className="text-blue-600 mt-1" />
                  <span>Earn rewards and recognition</span>
                </li>
              </ul>
            </motion.div>

            {/* Government Features */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-md"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <FaChartLine className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Government</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <FaChartLine className="text-green-600 mt-1" />
                  <span>Dashboard with analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaMapMarkedAlt className="text-green-600 mt-1" />
                  <span>Geographic issue visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaGlobe className="text-green-600 mt-1" />
                  <span>Department-wise issue management</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaShieldAlt className="text-green-600 mt-1" />
                  <span>Transparency in resolution process</span>
                </li>
              </ul>
            </motion.div>

            {/* Platform Features */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-md"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FaStar className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Platform Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <FaMobileAlt className="text-purple-600 mt-1" />
                  <span>Mobile-responsive design</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaGlobe className="text-purple-600 mt-1" />
                  <span>Multi-language support</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBell className="text-purple-600 mt-1" />
                  <span>Push notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaAward className="text-purple-600 mt-1" />
                  <span>Gamification & reward system</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join thousands of citizens and government officials working together to build better communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
            >
              Report an Issue
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-sm hover:shadow-md"
            >
              Citizen Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="JanSetu Logo" className="h-10 w-auto" />
              <span className="font-bold text-xl">JanSetu</span>
            </div>
            <p className="text-gray-400">
              Bridging the gap between citizens and government through technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/map" className="hover:text-white">View Issues Map</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-400">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-purple-600">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-700">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} JanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}