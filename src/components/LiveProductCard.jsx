import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { apiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { star } from "../assets/icons";
import { shoe8 } from "../assets/images";
import FavoriteButton from './FavoriteButton';

const LiveProductCard = ({ product, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { actions } = useApp();
  const navigate = useNavigate();

  const handleImageError = () => {
    console.log(`Image error for ${product.item_code}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`Image loaded for ${product.item_code}`);
    setImageLoading(false);
  };

  // Fallback image from assets
  const fallbackImage = shoe8;

  // Format price in Djiboutian Franc
  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 200;
    return `${numPrice.toLocaleString('fr-DJ')} DJF`;
  };

  // Navigate to product detail page
  const handleCardClick = () => {
    navigate(`/product/${product.item_code}`);
  };

  // Add to cart handler (prevent event bubbling)
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    try {
      // Create cart item from product data
      const cartItem = {
        id: product.item_code, // Using item_code as unique ID
        name: product.item_name || 'Product',
        price: parseFloat(product.price) || 200,
        image: imageError ? fallbackImage : (product.image_url || apiService.getImageUrl(product)),
        quantity: 1,
        size: 'M', // Default size for now, will be enhanced in product detail
        category: product.item_group || 'Product',
        stock: product.stock_quantity || 0,
        itemCode: product.item_code,
        description: product.description || ''
      };

      // Add to cart using context
      actions.addToCart(cartItem);
      
      // Show success toast
      toast.success(`${product.item_name} added to cart!`, {
        icon: '🛒',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div 
      className={`flex flex-1 flex-col w-full max-sm:w-full group cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
    >
      {/* Image container with white styling to match Men's page */}
      <div className='relative overflow-hidden rounded-2xl bg-white p-8 modern-card border border-gray-200 shadow-sm'>
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-red"></div>
          </div>
        )}
        
        {!imageError && (product.image_url || product.item_code) ? (
          <motion.img 
            src={product.image_url || apiService.getImageUrl(product)}
            alt={product.item_name}
            className={`w-full h-[280px] object-contain transition-transform duration-500 group-hover:scale-110 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            whileHover={{ rotateY: 5 }}
            transition={{ duration: 0.3 }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <motion.img 
            src={fallbackImage}
            alt={product.item_name}
            className="w-full h-[280px] object-contain transition-transform duration-500 group-hover:scale-110 opacity-100"
            whileHover={{ rotateY: 5 }}
            transition={{ duration: 0.3 }}
            onLoad={() => setImageLoading(false)}
          />
        )}
        
        {/* Gradient overlay on hover */}
        <div className='absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl' />
        
        {/* Live Data badge */}
        <div className='absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold'>
          Live Data
        </div>
        
        {/* Stock badge */}
        <div className='absolute top-4 right-4 bg-coral-red text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          Stock: {product.stock_quantity || 0}
        </div>

        {/* Favorite Button - positioned in top-right corner */}
        <div className="absolute top-16 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FavoriteButton 
            product={product} 
            size="md" 
            className="transform hover:scale-110"
          />
        </div>

        {/* Live indicator */}
        <div className="absolute bottom-4 right-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Cart Icon Button - appears on hover */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            className={`bg-coral-red text-white p-3 rounded-full transition-all duration-300 hover:bg-coral-red/90 flex items-center justify-center ${
              (product.stock_quantity || 0) === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={{ scale: (product.stock_quantity || 0) === 0 ? 1 : 1.1 }}
            whileTap={{ scale: (product.stock_quantity || 0) === 0 ? 1 : 0.9 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart || (product.stock_quantity || 0) === 0}
            title={(product.stock_quantity || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Content section - with black text for white theme */}
      <div className='mt-6 space-y-3'>
        {/* Product name */}
        <motion.h3 
          className='text-xl sm:text-2xl leading-normal font-semibold font-palanquin text-black'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {product.item_name || 'Product'}
        </motion.h3>

        {/* Category */}
        <motion.p 
          className="text-sm text-black/60 font-montserrat"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {product.item_group || 'Product'}
        </motion.p>

        {/* Price and Stock on same line */}
        <motion.div 
          className='flex justify-between items-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className='font-montserrat font-bold text-2xl leading-normal bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent'>
            {formatPrice(product.price)}
          </p>
          <p className='text-slate-600 text-sm font-montserrat font-medium'>
            Stock: {product.stock_quantity || 0}
          </p>
        </motion.div>

        {/* Modern Gradient Button */}
        <motion.button
          className="w-full mt-4 relative overflow-hidden group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
          <span className="relative block py-3 px-6 text-white font-semibold tracking-wide">
            View Details
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LiveProductCard; 