import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaVideo, FaPaperPlane, FaTimes, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import NavBarCitizen from "./NavBarCitizen";
// Removed legacy services import; using React Query mutation hook instead
import { useCreateIssue } from "../../hooks/useCreateIssue";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IssueCard = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Road Maintenance");
  const [urgency, setUrgency] = useState("Medium");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState(null);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [showMapButton, setShowMapButton] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const { mutateAsync: createIssue, isPending } = useCreateIssue();

  // Get location from localStorage when component mounts
  useEffect(() => {
    const savedLocation = localStorage.getItem('issueLocation');
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        const { lat, lng, address } = locationData;
        
        setLatitude(lat);
        setLongitude(lng);
        setLocation(`${address} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`);
        setShowMapButton(false);
        
        // Clear the stored location after use
        localStorage.removeItem('issueLocation');
      } catch (error) {
        console.error("Error parsing location data:", error);
        toast.error("Error loading location. Please select again.");
      }
    }
  }, []);

  const startCamera = async (mode) => {
    try {
      setCaptureMode(mode);
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: mode === 'video'
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    setCaptureMode(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(blob => {
        const file = new File([blob], `issue-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
  setMediaPreview(URL.createObjectURL(file));
  setMediaFile(file);
  setMediaType('image');
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const startVideoRecording = () => {
    // For simplicity, we'll just capture a short video
    // In a real app, you would use MediaRecorder API
    setTimeout(() => {
      // Simulate recording for 5 seconds
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(blob => {
          const file = new File([blob], `issue-video-${Date.now()}.mp4`, { type: 'video/mp4' });
          setMediaPreview(URL.createObjectURL(file));
          setMediaFile(file);
          setMediaType('video');
          stopCamera();
        }, 'video/mp4', 0.8);
      }
    }, 5000);
  };

  const removeMedia = () => {
  if (mediaPreview) URL.revokeObjectURL(mediaPreview);
  setMediaPreview(null);
  setMediaFile(null);
  setMediaType(null);
  };

  const handleLocationSelect = () => {
    // Store a flag to indicate we're coming from IssueCard
    localStorage.setItem('fromIssueCard', 'true');
    // Navigate to the map selection page using React Router
    navigate('/map');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate location
    if (!latitude || !longitude) {
      toast.error("Please select a location on the map");
      return;
    }
    
    setUploading(true);
    try {
      const files = mediaFile ? [mediaFile] : [];
      await createIssue({
        files,
        title,
        description,
        category,
        urgency,
        latitude,
        longitude
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Road Maintenance");
      setUrgency("Medium");
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
      setMediaFile(null);
      setMediaType(null);
      setLocation("");
      setLatitude(null);
      setLongitude(null);
      setShowMapButton(true);

      setSubmitted(true);
      toast.success("Issue reported successfully!");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error creating issue', error);
      toast.error(error.message || 'Failed to report issue');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Road Maintenance");
    setUrgency("Medium");
  if (mediaPreview) URL.revokeObjectURL(mediaPreview);
  setMediaPreview(null);
  setMediaFile(null);
  setMediaType(null);
    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setShowMapButton(true);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 p-6">
        <NavBarCitizen />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Issue Reported Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for reporting the issue. Your contribution helps improve the community.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetForm}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              Report Another Issue
            </button>
            <button
              onClick={() => navigate('/citizen')}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg shadow hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 p-6">
      <NavBarCitizen />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold">Report New Issue</h2>
          <p className="text-blue-100">Help improve your community by reporting issues</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Briefly describe the issue"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Provide more details about the issue..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Road Maintenance">Road Maintenance</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Electricity">Electricity</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Public Transport">Public Transport</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          
          {/* Location Selection Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Issue Location *</label>
            {showMapButton ? (
              <button
                type="button"
                onClick={handleLocationSelect}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors bg-blue-50"
              >
                <FaMapMarkerAlt className="text-blue-600" />
                <span className="text-blue-700 font-medium">Select Location on Map</span>
              </button>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium mb-1">Selected Location:</p>
                    <p className="text-blue-700 text-sm">{location}</p>
                    {latitude && longitude && (
                      <p className="text-blue-600 text-xs mt-1">
                        Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("");
                      setLatitude(null);
                      setLongitude(null);
                      setShowMapButton(true);
                    }}
                    className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                    title="Change Location"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              * Double-click on the map to select a location
            </p>
          </div>
          
          {/* Media Capture Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Add Media Evidence</label>
            
            {!mediaPreview ? (
              <div className="flex flex-col space-y-4">
                {!isCapturing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => startCamera('photo')}
                      className="flex items-center justify-center gap-2 p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaCamera className="text-lg" />
                      <span>Take Photo</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => startCamera('video')}
                      className="flex items-center justify-center gap-2 p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaVideo className="text-lg" />
                      <span>Record Video</span>
                    </button>
                  </>
                ) : (
                  <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                      {captureMode === 'photo' ? (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaCamera className="text-xl" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startVideoRecording}
                          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaVideo className="text-xl" />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                {mediaType === 'image' ? (
                  <img 
                    src={mediaPreview} 
                    alt="Issue evidence" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <video 
                    src={mediaPreview} 
                    controls 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Reporting Issue...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>Report Issue</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default IssueCard;