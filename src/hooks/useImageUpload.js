// src/hooks/useImageUpload.js
import { useState } from 'react';
import { supabaseService } from '../services/supabaseService';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadImage = async (file, bucketName, folderPath) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const result = await supabaseService.uploadImage(file, bucketName, folderPath);
      
      if (!result.success) {
        setUploadError(result.error);
        return null;
      }
      
      return result;
    } catch (error) {
      setUploadError(error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (filePath, bucketName) => {
    try {
      const result = await supabaseService.deleteImage(filePath, bucketName);
      return result.success;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null)
  };
};