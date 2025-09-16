import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import NavBarGov from "../components/Gov/NavBarGov";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function GovernmentDashboard() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [priorityIssues, setPriorityIssues] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, you would fetch from your API
        const sectorData = [
          { name: "Roads", shortName: "Roads", issues: 120, resolved: 80 },
          { name: "Water Supply", shortName: "Water", issues: 90, resolved: 70 },
          { name: "Electricity", shortName: "Electric", issues: 75, resolved: 60 },
          { name: "Sanitation", shortName: "Sanit.", issues: 110, resolved: 95 },
          { name: "Public Transport", shortName: "Transport", issues: 65, resolved: 50 },
        ];
        
        setSectors(sectorData);
        
        // Simulate priority issues
        setPriorityIssues([
          { id: 1, title: "Major water pipeline leak", sector: "Water Supply", daysOpen: 5 },
          { id: 2, title: "Bridge structural damage", sector: "Roads", daysOpen: 3 },
          { id: 3, title: "Power outage in downtown area", sector: "Electricity", daysOpen: 2 },
        ]);

        // Prepare trend data
        setTrendData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Reported Issues',
              data: [380, 420, 395, 460, 435, 410, 460],
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.3,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Resolved Issues',
              data: [290, 320, 310, 355, 340, 330, 355],
              borderColor: 'rgba(46, 204, 113, 1)',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              tension: 0.3,
              fill: true,
              borderWidth: 2
            }
          ]
        });

        // Prepare comparison data
        setComparisonData({
          labels: sectorData.map(s => s.name),
          datasets: [
            {
              label: 'Reported Issues',
              data: sectorData.map(s => s.issues),
              backgroundColor: 'rgba(52, 152, 219, 0.7)',
              borderColor: 'rgba(52, 152, 219, 1)',
              borderWidth: 1
            },
            {
              label: 'Resolved Issues',
              data: sectorData.map(s => s.resolved),
              backgroundColor: 'rgba(46, 204, 113, 0.7)',
              borderColor: 'rgba(46, 204, 113, 1)',
              borderWidth: 1
            }
          ]
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const totalIssues = sectors.reduce((sum, sector) => sum + sector.issues, 0);
  const totalResolved = sectors.reduce((sum, sector) => sum + sector.resolved, 0);
  const overallResolutionRate = Math.round((totalResolved / totalIssues) * 100);
  
  const roadsSector = sectors.find(s => s.name === "Roads") || {issues: 0, resolved: 0};
  const roadsResolutionRate = Math.round((roadsSector.resolved / roadsSector.issues) * 100);

  // Chart options
  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Performance Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Issues'
        }
      }
    }
  };

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Across Service Sectors'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Issues'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200">
      <NavBarGov />
      <div className="container mx-auto p-4">
        <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-2xl p-6 mb-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold font-montserrat">Municipal Services Performance Dashboard</h1>
            <p className="text-blue-200 mt-2">Comprehensive overview of citizen reports and service resolution metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-blue-700 bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all">
              <i className="fas fa-download"></i> Export Report
            </button>
            <button className="bg-blue-700 bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all">
              <i className="fas fa-cog"></i> Settings
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Performance Overview Card */}
          <div className="md:col-span-4 bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden border-t-4 border-blue-500">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-chart-line text-blue-500"></i> Performance Overview
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <i className="fas fa-sync-alt text-sm"></i>
                </button>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Total Issues</span>
              <div className="text-4xl font-bold text-gray-800 my-2">{totalIssues}</div>
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <i className="fas fa-arrow-up"></i> 12% from last month
              </div>
            </div>
            
            <div className="h-1 bg-gray-200 rounded-full my-6"></div>
            
            <div className="text-center">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Resolved Issues</span>
              <div className="text-4xl font-bold text-gray-800 my-2">{totalResolved}</div>
              
              <div className="h-2 bg-gray-200 rounded-full mt-4 mb-2 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 relative overflow-hidden"
                  style={{ width: `${overallResolutionRate}%` }}
                >
                  <div className="absolute inset-0 bg-repeat bg-[length:20px_20px] pattern-diagonal-lines opacity-20"></div>
                </div>
              </div>
              
              <span className="text-sm text-gray-500">{overallResolutionRate}% Resolution Rate</span>
            </div>
          </div>
          
          {/* Service Sectors Card */}
          <div className="md:col-span-4 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-layer-group text-blue-500"></i> Service Sectors
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <i className="fas fa-filter text-sm"></i>
                </button>
              </div>
            </div>
            
            <ul className="space-y-4">
              {sectors.map((sector, index) => (
                <li key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                      sector.name === "Roads" ? "bg-gradient-to-br from-blue-500 to-blue-800" :
                      sector.name === "Water Supply" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                      sector.name === "Electricity" ? "bg-gradient-to-br from-yellow-500 to-orange-500" :
                      sector.name === "Sanitation" ? "bg-gradient-to-br from-green-500 to-green-700" :
                      "bg-gradient-to-br from-purple-500 to-purple-700"
                    }`}>
                      <i className={`fas fa-${sector.name === "Roads" ? "road" : 
                                      sector.name === "Water Supply" ? "tint" : 
                                      sector.name === "Electricity" ? "bolt" : 
                                      sector.name === "Sanitation" ? "trash-alt" : "bus"}`}></i>
                    </div>
                    <span className="font-medium text-gray-700">{sector.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{sector.issues} issues</div>
                    <div className="text-sm text-green-600">{sector.resolved} resolved</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* High Priority Issues Card */}
          <div className="md:col-span-4 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-red-500"></i> High Priority Issues
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <i className="fas fa-ellipsis-h text-sm"></i>
                </button>
              </div>
            </div>
            
            {priorityIssues.map(issue => (
              <div key={issue.id} className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-5 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <i className={`fas fa-${issue.sector === "Roads" ? "road" : 
                                    issue.sector === "Water Supply" ? "tint" : 
                                    issue.sector === "Electricity" ? "bolt" : "exclamation-triangle"} text-red-500`}></i>
                  <div className="font-semibold text-red-700">{issue.title}</div>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold ml-auto">PRIORITY</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{issue.sector}</span>
                  <span><i className="fas fa-clock mr-1"></i> {issue.daysOpen} days unresolved</span>
                </div>
              </div>
            ))}
            
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              These issues require immediate attention from department heads.
            </div>
          </div>
          
          {/* Roads Department Performance Card */}
          <div className="md:col-span-6 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-road text-blue-500"></i> Roads Department Performance
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <i className="fas fa-expand text-sm"></i>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <span className="text-sm text-gray-500 uppercase tracking-wider">Total Reports</span>
                <div className="text-3xl font-bold text-gray-800 my-2">{roadsSector.issues}</div>
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  <i className="fas fa-arrow-up"></i> 8% from last month
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-500 uppercase tracking-wider">Resolved</span>
                <div className="text-3xl font-bold text-gray-800 my-2">{roadsSector.resolved}</div>
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  <i className="fas fa-arrow-up"></i> 12% from last month
                </div>
              </div>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 relative overflow-hidden"
                style={{ width: `${roadsResolutionRate}%` }}
              >
                <div className="absolute inset-0 bg-repeat bg-[length:20px_20px] pattern-diagonal-lines opacity-20"></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>{roadsResolutionRate}% resolution rate</span>
              <span>Target: 80%</span>
            </div>
            
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              Road issues resolution is {80 - roadsResolutionRate}% below target for this quarter.
            </div>
          </div>
          
          {/* Resolution Trends Card */}
          <div className="md:col-span-6 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-chart-bar text-blue-500"></i> Resolution Trends
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <i className="fas fa-calendar text-sm"></i>
                </button>
              </div>
            </div>
            
            <div className="h-80">
              {trendData && <Line data={trendData} options={trendOptions} />}
            </div>
          </div>
          
          {/* Sector Comparison Card */}
          <div className="md:col-span-12 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="fas fa-chart-pie text-blue-500"></i> Sector-wise Reported vs Resolved Issues
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                  <i className="fas fa-download text-sm"></i>
                </button>
              </div>
            </div>
            
            <div className="h-80">
              {comparisonData && <Bar data={comparisonData} options={comparisonOptions} />}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .pattern-diagonal-lines {
          background-image: linear-gradient(
            -45deg, 
            rgba(255, 255, 255, 0.2) 25%, 
            transparent 25%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.2) 50%, 
            rgba(255, 255, 255, 0.2) 75%, 
            transparent 75%, 
            transparent
          );
          background-size: 20px 20px;
          animation: move 1s linear infinite;
        }
        
        @keyframes move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 20px 20px;
          }
        }
        
        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>
    </div>
  );
}