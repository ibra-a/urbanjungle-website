import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { apiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { star } from "../assets/icons";
import { shoe8 } from "../assets/images";
import FavoriteButton from './FavoriteButton';
import { extractBaseName as getBaseProductName } from '../utils/productNameUtils';

const LiveProductCard = memo(({ product, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { actions } = useApp();
  const navigate = useNavigate();
  
  // Get product images (could have multiple) - same as Tommy CK
  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : product?.image
    ? [product.image]
    : [];

  const hasMultipleImages = productImages.length > 1;
  
  // Display: use base name (before first "—") to avoid long variant strings in grids
  // getBaseProductName is imported from '../utils/productNameUtils' (extractBaseName)
  
  const fullName = product?.product_name || product?.item_name || '';
  const baseName = getBaseProductName(fullName) || fullName || 'Product';
  
  // Small subtitle for variant/colorway (best-effort)
  const variantLabel =
    (Array.isArray(product?.colors) && product.colors[0] && typeof product.colors[0] === 'object' && product.colors[0].color)
      ? product.colors[0].color
      : (() => {
          const parts = fullName.split('—').map(p => p.trim()).filter(Boolean);
          return parts.length > 1 ? parts.slice(1).join(' — ') : '';
        })();

  const handleImageError = () => {
    console.log(`Image error for ${baseName || product.item_code}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`Image loaded for ${baseName || product.item_code}`);
    setImageLoading(false);
  };

  // Fallback image from assets
  const fallbackImage = shoe8;

  // Get current image URL - same as Tommy CK
  const getCurrentImageUrl = () => {
    if (imageError) return null;
    if (productImages.length > 0) {
      return productImages[currentImageIndex] || productImages[0];
    }
    return null;
  };

  const primaryImageUrl = getCurrentImageUrl();

  // Handle hover to show alternate image - same as Tommy CK
  const handleMouseEnter = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex(0);
    }
  };

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
        name: product.product_name || product.item_name || 'Product',
        price: parseFloat(product.price) || 200,
        image: imageError ? fallbackImage : (primaryImageUrl || fallbackImage),
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
      toast.success(`${product.product_name || product.item_name || 'Product'} added to cart!`, {
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
      className={`group cursor-pointer ${className}`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden rounded-lg shadow-md group-hover:shadow-xl group-hover:shadow-yellow-500/20 transition-all duration-300 flex items-center justify-center p-4 border-2 border-transparent group-hover:border-yellow-500/30">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        )}
        
        {/* Product Image with crossfade - same as Tommy CK */}
        <AnimatePresence mode="wait">
          {!imageError && primaryImageUrl ? (
            <motion.img 
              key={currentImageIndex}
              src={primaryImageUrl}
              alt={baseName}
              className="w-full h-full object-contain"
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoading ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <motion.img 
              src={fallbackImage}
              alt={baseName}
              className="w-full h-full object-contain"
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImageLoading(false)}
            />
          )}
        </AnimatePresence>
        
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

        {/* Cart Icon Button - appears on hover with yellow glow */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            className={`bg-gradient-to-r from-yellow-500 to-yellow-400 text-black p-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
              (product.stock_quantity || 0) === 0 ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:shadow-yellow-500/50'
            }`}
            whileHover={{ 
              scale: (product.stock_quantity || 0) === 0 ? 1 : 1.1,
              boxShadow: (product.stock_quantity || 0) === 0 ? 'none' : "0 8px 20px rgba(251, 191, 36, 0.5)"
            }}
            whileTap={{ scale: (product.stock_quantity || 0) === 0 ? 1 : 0.9 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart || (product.stock_quantity || 0) === 0}
            title={(product.stock_quantity || 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={20} className="text-black" />
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
          {baseName}
        </motion.h3>
        
        {/* Variant / colorway (optional) */}
        {variantLabel && variantLabel.toLowerCase() !== baseName.toLowerCase() && (
          <p className="text-sm text-black/50 font-montserrat">
            {variantLabel}
          </p>
        )}

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
          <p className='font-montserrat font-bold text-2xl leading-normal text-yellow-500'>
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
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
          <span className="relative block py-3 px-6 text-white font-semibold tracking-wide">
            View Details
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
});

LiveProductCard.displayName = 'LiveProductCard';

export default LiveProductCard; 