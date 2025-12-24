
import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = '', style }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`} style={style}>
      {/* Placeholder / Blur Effect */}
      <div 
        className={`absolute inset-0 bg-gray-200 transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden="true"
      />
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`block w-full h-full object-cover transition-all duration-700 ease-in-out ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
        }`}
      />
    </div>
  );
};

export default LazyImage;
