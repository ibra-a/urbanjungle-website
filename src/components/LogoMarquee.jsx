import { useState, useEffect } from 'react';

const LogoMarquee = ({ 
  animationDuration = 80, 
  gap = 120
}) => {
  // Logo data array using paths to the logos in assets
  const logos = [
    { src: '/logos/Nike-Logo.png', alt: 'Nike', name: 'Nike' },
    { src: '/logos/adidaswhitefontlogo.png', alt: 'Adidas', name: 'Adidas' },
    { src: '/logos/Converse-Logo.png', alt: 'Converse', name: 'Converse' },
    { src: '/logos/adidaslogo.png', alt: 'Adidas Sport', name: 'Adidas Sport' },
    { src: '/logos/Nike-Logo.png', alt: 'Nike', name: 'Nike' },
    { src: '/logos/adidaswhitefontlogo.png', alt: 'Adidas', name: 'Adidas' },
    { src: '/logos/Converse-Logo.png', alt: 'Converse', name: 'Converse' },
    { src: '/logos/adidaslogo.png', alt: 'Adidas Sport', name: 'Adidas Sport' },
    { src: '/logos/Nike-Logo.png', alt: 'Nike', name: 'Nike' },
    { src: '/logos/adidaswhitefontlogo.png', alt: 'Adidas', name: 'Adidas' },
    { src: '/logos/Converse-Logo.png', alt: 'Converse', name: 'Converse' },
    { src: '/logos/adidaslogo.png', alt: 'Adidas Sport', name: 'Adidas Sport' }
  ];

  // Create multiple duplicates for seamless infinite flow
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        {/* Title */}
        <div style={titleContainerStyle}>
          <h2 style={titleStyle}>Trusted by Leading Brands</h2>
          <p style={subtitleStyle}>
            Partnering with the world's most innovative athletic brands
          </p>
        </div>

        {/* Seamless Marquee Flow - No Container Box */}
        <div style={marqueeWrapperStyle}>
          {/* Extended fade edges */}
          <div style={fadeLeftStyle}></div>
          <div style={fadeRightStyle}></div>
          
          {/* Infinite scrolling content */}
          <div 
            style={{
              ...marqueeContentStyle,
              animationDuration: `${animationDuration}s`
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div 
                key={`${logo.name}-${index}`} 
                style={{
                  ...logoItemStyle,
                  marginRight: `${gap}px`
                }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  style={logoStyle}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Updated styles for seamless atmospheric effect
const sectionStyle = {
  width: '100%',
  background: '#000000',
  padding: '4rem 0',
  overflow: 'hidden'
};

const containerStyle = {
  maxWidth: '1440px',
  margin: '0 auto',
  padding: '0 2rem'
};

const titleContainerStyle = {
  textAlign: 'center',
  marginBottom: '3rem'
};

const titleStyle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#ffffff',
  marginBottom: '1rem',
  letterSpacing: '-0.025em'
};

const subtitleStyle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '1.125rem',
  fontWeight: '400',
  color: 'rgba(255, 255, 255, 0.7)',
  maxWidth: '600px',
  margin: '0 auto'
};

const marqueeWrapperStyle = {
  position: 'relative',
  width: '100%',
  height: '100px',
  overflow: 'hidden',
  // Removed: background, border, borderRadius for seamless flow
};

const marqueeContentStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  width: 'fit-content',
  animation: 'logoScroll 80s linear infinite',
  willChange: 'transform',
  // No animation pause - continuous flow
};

const logoItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80px',
  flexShrink: 0,
  // Removed: transition and hover effects for background atmosphere
};

const logoStyle = {
  maxHeight: '50px',
  maxWidth: '140px',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  filter: 'grayscale(100%) brightness(0.6)',
  opacity: 0.6,
  // Removed: transition for static background effect
};

const fadeLeftStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: '-20px', // Extended beyond container
  width: '150px', // Wider fade
  background: 'linear-gradient(to right, #000000 0%, #000000 30%, rgba(0, 0, 0, 0.8) 70%, transparent 100%)',
  zIndex: 10,
  pointerEvents: 'none'
};

const fadeRightStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: '-20px', // Extended beyond container
  width: '150px', // Wider fade
  background: 'linear-gradient(to left, #000000 0%, #000000 30%, rgba(0, 0, 0, 0.8) 70%, transparent 100%)',
  zIndex: 10,
  pointerEvents: 'none'
};

export default LogoMarquee; 