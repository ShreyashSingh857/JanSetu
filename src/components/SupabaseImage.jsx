// src/components/SupabaseImage.jsx
import React from 'react';
import { supabaseService } from '../services/supabaseService';

const SupabaseImage = ({ 
  src, 
  bucketName = 'images', 
  alt = "Image", 
  className = "", 
  width = 300, 
  height = 200,
  ...props 
}) => {
  // If src is already a full URL, use it directly
  const imageUrl = src?.startsWith('http') 
    ? src 
    : supabaseService.getImageUrl(src, bucketName);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      onError={(e) => {
        e.target.style.display = 'none';
      }}
      {...props}
    />
  );
};

export default SupabaseImage;