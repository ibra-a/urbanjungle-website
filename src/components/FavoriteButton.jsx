import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const FavoriteButton = ({ 
  product, 
  size = 'md', 
  className = '',
  showTooltip = true 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { state, actions } = useApp();

  // Only show for authenticated users
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

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

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('nike_token');
    if (!token) {
      return;
    }

    if (!product) return;

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
          const productName = product.item_name || 'Product';
          actions.showFavoriteNotification(`The product has been added to Favorites`, 'added');
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            actions.hideFavoriteNotification();
          }, 5000);
        } else {
          // Show removal notification
          const productName = product.item_name || 'Product';
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

  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      heart: 'w-4 h-4',
      shadow: 'shadow-md'
    },
    md: {
      container: 'w-10 h-10',
      heart: 'w-5 h-5',
      shadow: 'shadow-lg'
    },
    lg: {
      container: 'w-12 h-12',
      heart: 'w-6 h-6',
      shadow: 'shadow-xl'
    }
  };

  const config = sizeConfig[size];

  return (
    <motion.button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        ${config.container}
        relative
        flex items-center justify-center
        rounded-full
        transition-all duration-300 ease-out
        ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${isFavorite 
          ? 'bg-yellow-500 text-white shadow-lg shadow-nike-coral/30 border-2 border-yellow-500' 
          : 'bg-black/80 text-white border-2 border-black/80 hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-lg hover:shadow-nike-coral/30'
        }
        backdrop-blur-sm
        ${config.shadow}
        ${className}
      `}
      whileHover={{ 
        scale: isLoading ? 1 : 1.1,
        rotate: isLoading ? 0 : isFavorite ? 0 : 5
      }}
      whileTap={{ 
        scale: isLoading ? 1 : 0.95,
        rotate: 0
      }}
      title={
        showTooltip 
          ? isFavorite 
            ? 'Remove from favorites' 
            : 'Add to favorites'
          : ''
      }
      initial={false}
      animate={{
        scale: isLoading ? [1, 1.05, 1] : 1,
      }}
      transition={{
        scale: {
          duration: isLoading ? 1 : 0.3,
          repeat: isLoading ? Infinity : 0,
          ease: "easeInOut"
        }
      }}
    >
      {/* Premium background glow effect */}
      {isFavorite && (
        <motion.div
          className="absolute inset-0 bg-yellow-500 rounded-full opacity-50 blur-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1.3 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Heart icon with premium animations */}
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{
          scale: isLoading ? [1, 1.2, 1] : 1,
          rotate: isFavorite ? [0, 10, -10, 0] : 0
        }}
        transition={{
          scale: {
            duration: isLoading ? 0.8 : 0.3,
            repeat: isLoading ? Infinity : 0,
            ease: "easeInOut"
          },
          rotate: {
            duration: 0.5,
            ease: "easeInOut"
          }
        }}
      >
        {isLoading ? (
          <div className={`
            ${config.heart.replace('w-', 'w-').replace('h-', 'h-')}
            border-2 border-current border-t-transparent 
            rounded-full animate-spin
          `} />
        ) : (
          <Heart
            className={`
              ${config.heart}
              transition-all duration-300
              ${isFavorite 
                ? 'fill-white text-white drop-shadow-sm' 
                : 'fill-none text-white group-hover:fill-white'
              }
            `}
          />
        )}
      </motion.div>

      {/* Favorite pulse animation */}
      {isFavorite && !isLoading && (
        <motion.div
          className="absolute inset-0 border-2 border-white/30 rounded-full"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </motion.button>
  );
};

export default FavoriteButton; 