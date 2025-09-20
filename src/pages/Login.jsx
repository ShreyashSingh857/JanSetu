// src/pages/Login.jsx - Updated for email verification
import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaBuilding, 
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEnvelope,
  FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import logo from '../assets/jansetunew.png';

const Login = () => {
  const [activeScreen, setActiveScreen] = useState('type');
  const [loginType, setLoginType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ 
    message: '', 
    visible: false, 
    type: 'success' 
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, visible: true, type });
    setTimeout(() => {
      setNotification({ message: '', visible: false, type: 'success' });
    }, 3000);
  };

  const handleLoginTypeSelect = (type) => {
    setLoginType(type);
    setActiveScreen('email');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      setLoading(false);
      return;
    }
    
    try {
      if (isSignUp) {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: loginType,
              full_name: fullName
            }
          }
        });

        if (error) throw error;
        
        showNotification('Account created successfully! Please check your email for verification.');
        setIsSignUp(false);
        setPassword('');
        setFullName('');
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          // If user already has a stored user_type in metadata, enforce it
          const metaType = data.user.user_metadata?.user_type;
          if (metaType && metaType !== loginType) {
            showNotification(`Account registered as ${metaType}. Please choose the correct role.`, 'error');
            // Immediately sign out this session attempt
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          // Check if user exists in our users table, if not create them
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError && userError.code === 'PGRST116') {
            // User doesn't exist, create new user
            const userMetadata = data.user.user_metadata;
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.user.id,
                  email: email,
                  user_type: userMetadata.user_type || loginType,
                  full_name: userMetadata.full_name || `${loginType.charAt(0).toUpperCase() + loginType.slice(1)} User`,
                  created_at: new Date().toISOString()
                }
              ]);

            if (insertError) {
              console.error('Error creating user:', insertError);
            }
          }

          showNotification('Login successful! Redirecting...');
          
          // Store user info in localStorage
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', loginType);
          localStorage.setItem('email', email);
          localStorage.setItem('userId', data.user.id);
          
          // Redirect based on user type
          setTimeout(() => {
            window.location.href = loginType === 'citizen' ? '/citizen' : '/government';
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTypeSelection = () => {
    setLoginType('');
    setActiveScreen('type');
  };

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setFullName('');
  };

  const handleGoogleSignIn = async () => {
    if (!loginType) {
      showNotification('Select Citizen or Government first', 'error');
      return;
    }
    try {
      // Store intended role so callback can pick it up
      localStorage.setItem('pendingUserType', loginType);
      const redirectTo = import.meta.env.DEV
        ? 'http://localhost:5173/auth/callback'
        : 'https://jan-setu.vercel.app/auth/callback'; // update domain if you add custom
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      if (error) throw error;
    } catch (e) {
      console.error('Google sign-in error', e);
      showNotification(e.message || 'Google sign-in failed', 'error');
    }
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
              
              {/* Email Login Screen */}
              {activeScreen === 'email' && (
                <motion.div
                  key="email-screen"
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
                      {loginType === 'citizen' ? 'Citizen' : 'Government'} {isSignUp ? 'Sign Up' : 'Login'}
                    </h2>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {loginType === 'citizen' 
                      ? 'Access your civic engagement dashboard' 
                      : 'Access government issue management dashboard'
                    }
                  </p>
                  
                  <form onSubmit={handleEmailSubmit}>
                    {isSignUp && (
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="fullName">
                          Full Name *
                        </label>
                        <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-500 transition-colors">
                          <div className="flex-1 flex items-center">
                            <input
                              type="text"
                              id="fullName"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="flex-1 px-4 py-3 outline-none bg-white"
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                        Email Address *
                      </label>
                      <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-500 transition-colors">
                        <div className="flex-1 flex items-center">
                          <FaEnvelope className="text-gray-400 ml-4" />
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-4 py-3 outline-none bg-white"
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                        Password *
                      </label>
                      <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-500 transition-colors">
                        <div className="flex-1 flex items-center">
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 px-4 py-3 outline-none bg-white"
                            placeholder="Enter your password"
                            required
                            minLength="6"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {isSignUp ? 'Password must be at least 6 characters long' : 'Enter your password'}
                      </p>
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
                          {isSignUp ? 'Creating Account...' : 'Logging in...'}
                        </>
                      ) : (
                        isSignUp ? 'Create Account' : 'Login'
                      )}
                    </motion.button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleSignIn}
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center mb-4 bg-white shadow-sm"
                    >
                      <span className="mr-3 inline-block">
                        <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                          <path d="M533.5 278.4c0-18.5-1.5-37-4.7-55H272v104.2h146.9c-6.3 34.4-25.6 63.6-54.5 82.7v68h87.7c51.3-47.3 81.4-117 81.4-199.9z" fill="#4285F4"/>
                          <path d="M272 544.3c73.7 0 135.6-24.4 180.8-66.1l-87.7-68c-24.4 16.3-55.7 25.8-93.1 25.8-71.5 0-132.2-48.2-153.9-112.9H27.5v70.9c45.8 90.5 140 150.3 244.5 150.3z" fill="#34A853"/>
                          <path d="M118.1 322.9c-10.6-31.6-10.6-65.9 0-97.5V154.5H27.5c-39.6 78.9-39.6 172.2 0 251.1l90.6-70.9z" fill="#FBBC05"/>
                          <path d="M272 107.7c39.9-.6 78.4 14.6 107.7 42.5l80.2-80.2C407.4 24.6 348.7-.5 272 0 167.5 0 73.3 59.8 27.5 150.3l90.6 70.9C139.3 155.8 200.5 107.7 272 107.7z" fill="#EA4335"/>
                        </svg>
                      </span>
                      Continue with Google
                    </motion.button>
                    
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={toggleSignUpMode}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {isSignUp 
                          ? 'Already have an account? Login here' 
                          : "Don't have an account? Sign up here"
                        }
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-8 text-center text-sm text-gray-500">
                    By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </div>
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
    </div>
  );
};

export default Login;