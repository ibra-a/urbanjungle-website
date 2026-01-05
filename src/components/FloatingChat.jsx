import React, { useState } from 'react';

const FloatingChat = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="floating-chat-container">
      <div 
        className={`floating-chat-button ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          // Add your chat functionality here
          console.log('Chat opened');
        }}
      >
        {/* Chat Icon SVG */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="chat-icon"
        >
          <path 
            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" 
            fill="currentColor"
          />
          <circle cx="7" cy="9" r="1" fill="currentColor"/>
          <circle cx="12" cy="9" r="1" fill="currentColor"/>
          <circle cx="17" cy="9" r="1" fill="currentColor"/>
        </svg>
        
        {/* Hover Text */}
        <span className="chat-tooltip">Need Help?</span>
        
        {/* Notification Badge */}
        <div className="chat-notification-badge">
          <span>1</span>
        </div>
      </div>
      
      {/* Pulse Animation Background */}
      <div className="chat-pulse-bg"></div>
    </div>
  );
};

export default FloatingChat; 