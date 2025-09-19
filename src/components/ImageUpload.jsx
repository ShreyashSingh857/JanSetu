// src/components/ImageUpload.jsx
import React, { useRef, useState } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ onUploadSuccess, bucketName = 'images', folderPath = '' }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { uploadImage, isUploading, uploadError, clearError } = useImageUpload();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    // Upload image
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    clearError();
    
    const result = await uploadImage(file, bucketName, folderPath);
    
    if (result) {
      toast.success('Image uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(result.publicUrl, result.filePath);
      }
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      toast.error(uploadError || 'Failed to upload image');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="image-upload-container">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        
        <label htmlFor="image-upload" className="cursor-pointer">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">
                Drag & drop an image here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports JPG, PNG, GIF, WEBP
              </p>
            </div>
          )}
        </label>

        {previewUrl && !isUploading && (
          <div className="mt-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded-lg mx-auto"
            />
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            Error: {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;