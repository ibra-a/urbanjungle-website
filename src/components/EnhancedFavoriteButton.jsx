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
        className={`w-full py-4 border border-gray-300 rounded-full font-semibold text-lg hover:border-coral-red transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        <Heart size={20} />
        Favorite ❤️
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Main favorite button */}
      <motion.button
        onClick={toggleFavorite}
        disabled={isLoading}
        className={`w-full py-4 border rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          isFavorite
            ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-300 hover:border-coral-red'
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
                isFavorite ? 'fill-red-500 text-red-500' : 'fill-none'
              }`}
            />
            {isFavorite ? 'Remove from Favorites' : 'Favorite ❤️'}
          </>
        )}
      </motion.button>
    </div>
  );
};

export default EnhancedFavoriteButton; 