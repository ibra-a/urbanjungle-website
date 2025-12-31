import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * 
 * Automatically scrolls to the top of the page when the route changes.
 * This ensures users always see the top of the page when navigating between routes.
 * 
 * Usage: Add <ScrollToTop /> inside your Router component
 */
const ScrollToTop = ({ behavior = 'instant' }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo({ 
      top: 0, 
      left: 0,
      behavior: behavior 
    });
  }, [pathname, behavior]);

  return null;
};

export default ScrollToTop;


