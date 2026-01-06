import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const EnhancedFavoriteButton = ({ product, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { state, actions } = useApp();
  const navigate = useNavigate();

  // Check if product is favorited
  useEffect(() => {
    if (state.isAuthenticated && product) {
      checkIfFavorite();
    }
  }, [state.isAuthenticated, product]);

  const checkIfFavorite = async () => {
    const token = localStorage.getItem('nike_token');
    if (!token || !product) return;

    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const favoriteExists = data.favorites.some(
          fav => fav.product_id === product.item_code
        );
        setIsFavorite(favoriteExists);
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    // Redirect to login if not authenticated
    if (!state.isAuthenticated) {
      // You could trigger a login modal here instead
      navigate('/', { state: { showLogin: true } });
      return;
    }

    const token = localStorage.getItem('nike_token');
    if (!token || !product) return;

    setIsLoading(true);

    try {
      const url = `http://localhost:5000/api/favorites/${product.item_code}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const body = isFavorite ? undefined : JSON.stringify({
        product_name: product.item_name,
        product_price: product.price
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        
        // Dispatch event to update navbar favorites
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        
        if (!isFavorite) {
          // Show Urban Jungle-style notification
          actions.showFavoriteNotification(`The product has been added to Favorites`, 'added');
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            actions.hideFavoriteNotification();
          }, 5000);
        } else {
          // Show removal notification
          actions.showFavoriteNotification(`The product has been removed from Favorites`, 'removed');
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            actions.hideFavoriteNotification();
          }, 5000);
        }
      } else {
        console.error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if user is not authenticated
  if (!state.isAuthenticated) {
    return (
      <button 
        onClick={() => navigate('/', { state: { showLogin: true } })}
        className={`w-full py-4 border-2 border-yellow-500 bg-transparent text-yellow-500 rounded-full font-semibold text-lg hover:bg-gradient-to-r hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${className}`}
      >
        <Heart size={20} className="text-yellow-500" />
        Add to Favorites
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Main favorite button */}
      <motion.button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`w-full py-4 sm:py-4 border-2 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px] ${
          isFavorite
            ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black hover:shadow-lg hover:shadow-yellow-500/40'
            : 'border-yellow-500 bg-transparent text-yellow-500 hover:bg-gradient-to-r hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-500/30'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {isFavorite ? 'Removing...' : 'Adding...'}
          </>
        ) : (
          <>
            <Heart 
              size={20} 
              className={`transition-colors duration-200 ${
                isFavorite ? 'fill-black text-black' : 'fill-none text-yellow-500'
              }`}
            />
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </>
        )}
      </motion.button>
    </div>
  );
};

export default EnhancedFavoriteButton; 