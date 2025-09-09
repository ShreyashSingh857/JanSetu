// src/pages/Login.jsx - Complete updated version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaBuilding, 
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPhone,
  FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/jansetunew.png';

const Login = () => {
  const [activeScreen, setActiveScreen] = useState('type');
  const [loginType, setLoginType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ 
    message: '', 
    visible: false, 
    type: 'success' 
  });
  const [countdown, setCountdown] = useState(0);
  const { signInWithPhone, verifyOtp } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, visible: true, type });
    setTimeout(() => {
      setNotification({ message: '', visible: false, type: 'success' });
    }, 3000);
  };

  const handleLoginTypeSelect = (type) => {
    setLoginType(type);
    setActiveScreen('phone');
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length !== 10) {
      showNotification('Please enter a valid 10-digit phone number', 'error');
      setLoading(false);
      return;
    }
    
    try {
      // Format phone number with country code (India +91)
      const formattedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;
      await signInWithPhone(formattedPhone);
      setActiveScreen('otp');
      setCountdown(30); // 30-second countdown for resend
      showNotification(`Verification code sent to your phone for ${loginType} login!`);
    } catch (error) {
      console.error('Error sending OTP:', error);
      showNotification('Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp || otp.length !== 6) {
      showNotification('Please enter a valid 6-digit OTP', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await verifyOtp(otp);
      showNotification('Login successful! Redirecting...');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showNotification('Invalid OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const formattedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;
      await signInWithPhone(formattedPhone);
      setCountdown(30);
      showNotification('New verification code sent!');
    } catch (error) {
      console.error('Error resending OTP:', error);
      showNotification('Failed to resend OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTypeSelection = () => {
    setLoginType('');
    setActiveScreen('type');
  };

  const handleBackToPhone = () => {
    setActiveScreen('phone');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-gray-200"
        >
          {/* Left Panel - Branding */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 lg:p-10 flex-1 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="grid grid-cols-3 gap-4 transform rotate-45 scale-150">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-20 w-20 rounded-full bg-white"></div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="JanSetu Logo" className="h-12 w-auto" />
                <span className="text-2xl font-bold">JanSetu</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">
                Bridging Citizens & Government
              </h1>
              <p className="text-blue-100 mb-8 text-lg">
                A unified platform for civic engagement and issue resolution
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-white" />
                  </div>
                  <span>Report issues and track progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <FaBuilding className="text-white" />
                  </div>
                  <span>Efficient government response system</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <FaShieldAlt className="text-white" />
                  </div>
                  <span>Secure and transparent process</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Login Forms */}
          <div className="p-8 lg:p-10 flex-1 flex flex-col justify-center bg-white">
            <AnimatePresence mode="wait">
              {/* Login Type Selection Screen */}
              {activeScreen === 'type' && (
                <motion.div
                  key="type-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full max-w-md mx-auto"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to JanSetu</h2>
                  <p className="text-gray-600 mb-8">
                    Choose how you want to access the platform
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                      onClick={() => handleLoginTypeSelect('citizen')}
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FaUser className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-blue-600">Citizen Login</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Report issues, track progress, and engage with your community. Access base features for civic engagement.
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                      onClick={() => handleLoginTypeSelect('government')}
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FaBuilding className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-blue-600">Government Login</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Access government dashboard to manage and resolve reported issues. Specialized tools for authorities.
                      </p>
                    </motion.div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </div>
                </motion.div>
              )}
              
              {/* Phone Login Screen */}
              {activeScreen === 'phone' && (
                <motion.div
                  key="phone-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full max-w-md mx-auto"
                >
                  <button 
                    className="flex items-center text-blue-600 font-medium mb-6 hover:text-blue-800 transition-colors"
                    onClick={handleBackToTypeSelection}
                  >
                    <FaArrowLeft className="mr-2" /> Back to Login Options
                  </button>
                  
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      {loginType === 'citizen' ? (
                        <FaUser className="text-blue-600" />
                      ) : (
                        <FaBuilding className="text-blue-600" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {loginType === 'citizen' ? 'Citizen' : 'Government'} Login
                    </h2>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {loginType === 'citizen' 
                      ? 'Access your civic engagement dashboard' 
                      : 'Access government issue management dashboard'
                    }
                  </p>
                  
                  <form onSubmit={handlePhoneSubmit}>
                    <div className="mb-5">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                        Phone Number *
                      </label>
                      <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-500 transition-colors">
                        <div className="px-4 py-3 bg-gray-100 border-r-2 border-gray-300 font-medium flex items-center">
                          +91
                        </div>
                        <div className="flex-1 flex items-center">
                          <FaPhone className="text-gray-400 ml-4" />
                          <input
                            type="tel"
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="flex-1 px-4 py-3 outline-none bg-white"
                            placeholder="Enter your phone number"
                            required
                            maxLength="10"
                            pattern="[0-9]{10}"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Enter your 10-digit mobile number</p>
                    </div>
                    
                    <motion.button 
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending OTP...
                        </>
                      ) : (
                        'Send Verification Code'
                      )}
                    </motion.button>
                  </form>
                  
                  <div className="mt-8 text-center text-sm text-gray-500">
                    By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </div>
                </motion.div>
              )}
              
              {/* OTP Verification Screen */}
              {activeScreen === 'otp' && (
                <motion.div
                  key="otp-screen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full max-w-md mx-auto"
                >
                  <button 
                    className="flex items-center text-blue-600 font-medium mb-6 hover:text-blue-800 transition-colors"
                    onClick={handleBackToPhone}
                  >
                    <FaArrowLeft className="mr-2" /> Back to Phone Number
                  </button>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShieldAlt className="text-blue-600 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
                    <p className="text-gray-600">
                      We've sent a 6-digit code to <span className="font-medium">+91 {phoneNumber}</span>
                    </p>
                  </div>
                  
                  <form onSubmit={handleOtpSubmit}>
                    <div className="mb-5">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="otp">
                        Verification Code *
                      </label>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 text-center text-xl font-semibold tracking-widest"
                        placeholder="Enter 6-digit code"
                        required
                        maxLength="6"
                        pattern="[0-9]{6}"
                      />
                    </div>
                    
                    <motion.button 
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </motion.button>
                    
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={handleResendOtp}
                        disabled={countdown > 0 || loading}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      {/* Notification */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg flex items-center ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <FaCheckCircle className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;