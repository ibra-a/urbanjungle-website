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
      className={`group cursor-pointer flex flex-col h-full ${className}`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container - White background like Tommy CK */}
      <div className="relative aspect-[3/4] bg-white mb-4 overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-4 border border-gray-200 group-hover:border-yellow-500/50">
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
        
        {/* Live Data badge - Subtle like Tommy CK */}
        <div className='absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm'>
          • Live Stock
        </div>
        
        {/* Favorite Button - Always visible like Tommy CK */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton 
            product={product} 
            size="sm" 
            className="bg-white/90 backdrop-blur-sm shadow-sm"
          />
        </div>

      </div>

      {/* Content section - Clean layout like Tommy CK */}
      <div className='flex-1 flex flex-col space-y-2'>
        {/* Product name - Consistent height */}
        <h3 className='text-base sm:text-lg font-semibold font-palanquin text-black line-clamp-2 min-h-[2.5rem]'>
          {baseName}
        </h3>
        
        {/* Variant / colorway - Subtle */}
        {variantLabel && variantLabel.toLowerCase() !== baseName.toLowerCase() && (
          <p className="text-xs sm:text-sm text-gray-500 font-montserrat line-clamp-1">
            {variantLabel}
          </p>
        )}

        {/* Price - Prominent */}
        <div className='mt-auto pt-2'>
          <p className='font-montserrat font-bold text-lg sm:text-xl leading-normal text-yellow-500'>
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Add to Cart Button - Always visible like Tommy CK */}
        <motion.button
          className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded font-semibold text-sm sm:text-base transition-all duration-200 hover:border-yellow-500 hover:text-yellow-500 min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!isAddingToCart && (product.stock_quantity || 0) > 0 ? { scale: 1.01 } : {}}
          whileTap={!isAddingToCart && (product.stock_quantity || 0) > 0 ? { scale: 0.99 } : {}}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(e);
          }}
          disabled={isAddingToCart || (product.stock_quantity || 0) === 0}
        >
          {isAddingToCart ? (
            <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
          ) : (product.stock_quantity || 0) === 0 ? (
            'Out of Stock'
          ) : (
            'ADD TO CART'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
});

LiveProductCard.displayName = 'LiveProductCard';

export default LiveProductCard; 