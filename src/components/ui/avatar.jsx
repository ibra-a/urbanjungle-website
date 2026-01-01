import React from 'react';

const Avatar = ({ className = '', children }) => {
  return (
    <div className={`rounded-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

const AvatarImage = ({ src, alt, className = '' }) => {
  if (!src) return null;
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

const AvatarFallback = ({ children, className = '' }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback };

