import React, { useState } from 'react';

const CivicConnectLogin = () => {
  const [activeScreen, setActiveScreen] = useState('type'); // Start with login type selection
  const [loginType, setLoginType] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };

  const handleLoginTypeSelect = (type) => {
    setLoginType(type);
    setActiveScreen('phone');
  };

  const handleContinueWithPhone = () => {
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value.trim() === '') {
      alert('Please enter your phone number');
      return;
    }
    
    showNotification(`Verification code sent to your phone for ${loginType} login!`);
  };

  const handleBackToTypeSelection = () => {
    setLoginType('');
    setActiveScreen('type');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-gray-200">
          {/* Left Panel */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white p-8 lg:p-10 flex-1 flex flex-col justify-center">
            <div className="text-4xl font-bold mb-4">JanSetu</div>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Empowering citizens to report civic issues and collaborate with local authorities for a better community.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                { icon: 'lock', text: 'Secure Platform' },
                { icon: 'users', text: 'Community Driven' },
                { icon: 'flag', text: 'Report Issues' },
                { icon: 'chart-line', text: 'Track Progress' },
                { icon: 'mobile-alt', text: 'Mobile First' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                    <i className={`fas fa-${feature.icon} text-white`}></i>
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm opacity-80">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5K+</div>
                <div className="text-sm opacity-80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm opacity-80">Partner Clues</div>
              </div>
            </div>
          </div>
          
          {/* Right Panel */}
          <div className="p-8 lg:p-10 flex-1 flex flex-col justify-center bg-gray-50">
            {/* Login Type Selection Screen */}
            {activeScreen === 'type' && (
              <div className="w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to JanSetu</h2>
                <p className="text-gray-600 mb-6">
                  Choose how you want to access the platform.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div 
                    className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                    onClick={() => handleLoginTypeSelect('citizen')}
                  >
                    <h3 className="text-lg font-bold text-blue-600 mb-2">Citizen Login</h3>
                    <p className="text-gray-600">
                      Report issues, track progress, and engage with your community. Access base features for civic engagement.
                    </p>
                  </div>
                  
                  <div 
                    className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                    onClick={() => handleLoginTypeSelect('government')}
                  >
                    <h3 className="text-lg font-bold text-blue-600 mb-2">Government Login</h3>
                    <p className="text-gray-600">
                      Access government dashboard to manage and resolve reported issues. Specialized tools for authorities.
                    </p>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </div>
              </div>
            )}
            
            {/* Phone Login Screen */}
            {activeScreen === 'phone' && (
              <div className="w-full max-w-md mx-auto">
                <button 
                  className="flex items-center text-blue-600 font-medium mb-6"
                  onClick={handleBackToTypeSelection}
                >
                  <i className="fas fa-arrow-left mr-2"></i> Back to Login Options
                </button>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {loginType === 'citizen' ? 'Citizen' : 'Government'} Login
                </h2>
                <p className="text-gray-600 mb-6">
                  {loginType === 'citizen' 
                    ? 'Access your civic engagement dashboard' 
                    : 'Access government issue management dashboard'
                  }
                </p>
                
                <div className="mb-5">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                    Phone Number *
                  </label>
                  <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                    <div className="px-4 py-3 bg-gray-100 border-r-2 border-gray-300 font-medium">
                      +1
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      className="flex-1 px-4 py-3 outline-none bg-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                  onClick={handleContinueWithPhone}
                >
                  Continue with Phone
                </button>
                
                <div className="mt-8 text-center text-sm text-gray-500">
                  By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification */}
      {notification.visible && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default CivicConnectLogin;