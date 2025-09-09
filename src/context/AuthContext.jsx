// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Set up reCAPTCHA verifier
  const setUpRecaptcha = (phoneNumber) => {
    // Clear any existing recaptcha container
    const existingContainer = document.getElementById('recaptcha-container');
    if (existingContainer) {
      existingContainer.innerHTML = '';
    }
    
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('Recaptcha verified');
      },
      'expired-callback': () => {
        console.log('Recaptcha expired');
      }
    });

    return recaptchaVerifier;
  };

  // Sign in with phone number
  const signInWithPhone = async (phoneNumber) => {
    try {
      const recaptchaVerifier = setUpRecaptcha(phoneNumber);
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      return confirmation;
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Clear recaptcha on error
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      
      throw error;
    }
  };

  // Verify OTP
  const verifyOtp = async (code) => {
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please request a new OTP.');
      }
      
      const result = await confirmationResult.confirm(code);
      setCurrentUser(result.user);
      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid verification code. Please try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('Verification code has expired. Please request a new one.');
      } else {
        throw error;
      }
    }
  };

  // Sign out
  const logout = () => {
    // Clear recaptcha on logout
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = '';
    }
    
    setConfirmationResult(null);
    return signOut(auth);
  };

  // Clear recaptcha when component unmounts
  useEffect(() => {
    return () => {
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
    };
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        console.log('User logged in:', user.uid);
      } else {
        console.log('User logged out');
        // Clear recaptcha when user logs out
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
          recaptchaContainer.innerHTML = '';
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithPhone,
    verifyOtp,
    logout,
    confirmationResult,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}