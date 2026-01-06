import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AuthModal from '../components/AuthModal';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAddingToBag, setIsAddingToBag] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { state, actions } = useApp();
  const navigate = useNavigate();

  const sizes = ['S', 'M', 'L', 'XL', '2XL'];

  useEffect(() => {
    if (state.user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [state.user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const result = await actions.backend.favorites.getFavoritesWithDetails(state.user.id);
      
      if (result.success) {
        setFavorites(result.favorites || []);
      } else if (result.requiresAuth) {
        toast.error('Please sign in to view favorites');
        navigate('/');
      } else {
        console.error('Failed to fetch favorites:', result.error);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (productId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    setSelectedItems(new Set());
  };

  const handleDone = async () => {
    if (selectedItems.size > 0) {
      // Remove selected items
      if (!state.user) {
        toast.error('Please sign in');
        return;
      }

      try {
        // Remove all selected items
        await Promise.all(
          Array.from(selectedItems).map(productId =>
            actions.backend.favorites.removeFavorite(state.user.id, productId)
          )
        );

        // Update local state
        setFavorites(prev => prev.filter(fav => !selectedItems.has(fav.item_code)));
        
        // Sync favorites with server
        await actions.syncFavorites();
        
        // Show notification
        toast.success(
          `${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'} removed from Favorites`
        );

      } catch (error) {
        console.error('Error removing favorites:', error);
        toast.error('Failed to remove favorites');
      }
    }
    
    setIsEditMode(false);
    setSelectedItems(new Set());
  };

  const openSizeModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize('');
  };

  const closeSizeModal = () => {
    setSelectedProduct(null);
    setSelectedSize('');
  };

  const handleAddToBag = async () => {
    if (!selectedSize || !selectedProduct) {
      toast.error('Please select a size');
      return;
    }

    setIsAddingToBag(true);

    try {
      // Create cart item
      const cartItem = {
        id: selectedProduct.item_code,
        name: selectedProduct.item_name,
        price: parseFloat(selectedProduct.price) || 200,
        image: selectedProduct.image_url || '',
        quantity: 1,
        size: selectedSize,
        category: selectedProduct.item_group || 'Product',
        stock: selectedProduct.stock_quantity || 0,
        itemCode: selectedProduct.item_code,
        description: selectedProduct.description || ''
      };

      // Add to cart
      actions.addToCart(cartItem);
      
      // Show success message
      toast.success(`${selectedProduct.item_name} added to bag!`, {
        icon: '🛒',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // Close modal
      closeSizeModal();

    } catch (error) {
      console.error('Error adding to bag:', error);
      toast.error('Failed to add item to bag');
    } finally {
      setIsAddingToBag(false);
    }
  };

  const SizeSelectionModal = () => {
    if (!selectedProduct) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSizeModal}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeSizeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 bg-gray-100 p-8">
                <img
                  src={`http://localhost:5000/api/images/${selectedProduct.product_id}`}
                  alt={selectedProduct.product_name}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/400';
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.item_name}
                  </h2>
                  <p className="text-xl font-semibold text-gray-800">
                    {parseFloat(selectedProduct.price || 0).toLocaleString('fr-DJ')} DJF
                  </p>
                </div>

                {/* Size Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Size</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 px-2 border-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to Bag Button */}
                <motion.button
                  onClick={handleAddToBag}
                  disabled={!selectedSize || isAddingToBag}
                  className="w-full relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!selectedSize || isAddingToBag ? {} : { scale: 1.02 }}
                  whileTap={!selectedSize || isAddingToBag ? {} : { scale: 0.98 }}
                >
                  <div className={`absolute inset-0 rounded-full ${
                    !selectedSize || isAddingToBag
                      ? 'bg-gray-300'
                      : 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500'
                  }`}></div>
                  <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 ${
                    selectedSize && !isAddingToBag ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500' : ''
                  }`}></div>
                  <span className={`relative flex items-center justify-center gap-2 py-4 font-semibold text-lg tracking-wide ${
                    !selectedSize || isAddingToBag ? 'text-gray-500' : 'text-white'
                  }`}>
                    {isAddingToBag ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add to Bag'
                    )}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const FavoriteCard = ({ favorite, index }) => {
    const isSelected = selectedItems.has(favorite.product_id);
    
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out cursor-pointer
          ${isEditMode ? 'hover:scale-105' : 'hover:scale-102'} 
          ${isSelected ? 'ring-2 ring-black shadow-2xl scale-105' : 'shadow-sm hover:shadow-xl'}
        `}
        onClick={isEditMode ? () => toggleItemSelection(favorite.product_id) : undefined}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Selection overlay with animation */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-4 left-4 z-20"
            >
              <motion.div 
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-md
                  ${isSelected 
                    ? 'bg-black border-black text-white shadow-lg' 
                    : 'bg-white/90 border-gray-300 shadow-md'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heart icon with better styling */}
        {!isEditMode && (
          <motion.div 
            className="absolute top-4 right-4 z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
          </motion.div>
        )}

        {/* Product Image with enhanced styling */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          <img
            src={`http://localhost:5000/api/images/${favorite.product_id}`}
            alt={favorite.product_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300';
            }}
          />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Enhanced Product Info */}
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 leading-tight tracking-tight">
            {favorite.item_name || 'Product'}
          </h3>
          
          {favorite.price && (
            <p className="text-base font-medium mb-4 text-yellow-500">
              {parseFloat(favorite.price).toLocaleString('fr-DJ')} DJF
            </p>
          )}

          {/* Enhanced Select Size button */}
          {!isEditMode && (
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                openSizeModal(favorite);
              }}
              className="w-full relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
              <span className="relative block py-3 text-white font-semibold text-sm tracking-wide">
                Select Size
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  // Show sign-in prompt if user is not authenticated
  if (!state.user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ 
              boxShadow: [
                "0 10px 25px rgba(251, 191, 36, 0.3)",
                "0 20px 40px rgba(251, 191, 36, 0.4)",
                "0 10px 25px rgba(251, 191, 36, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-10 h-10 text-black" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Sign in to view your favorites
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Create an account or sign in to save your favorite products and access them anytime.
          </p>
          
          <div className="space-y-3">
            <motion.button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
              <span className="relative block py-4 text-black font-semibold text-lg tracking-wide">
                Sign In / Join Us
              </span>
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/shop')}
              className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:border-yellow-500 hover:text-yellow-500 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue Shopping
            </motion.button>
          </div>
          
          {/* Auth Modal */}
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode="login"
          />
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-32">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                  <div className="h-10 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-32">
        {/* Enhanced Header */}
        <motion.div 
          className="flex items-center justify-between mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Favorites</h1>
            <p className="text-lg text-gray-600 mt-2">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          {favorites.length > 0 && (
            <motion.button
              onClick={isEditMode ? handleDone : handleEditMode}
              className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isEditMode 
                  ? 'bg-black text-white hover:bg-gray-800 focus:ring-gray-400' 
                  : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white focus:ring-gray-400'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditMode ? 'Done' : 'Edit'}
            </motion.button>
          )}
        </motion.div>

        {/* Enhanced Favorites Grid */}
        <AnimatePresence>
          {favorites.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              layout
            >
              {favorites.map((favorite, index) => (
                <FavoriteCard key={favorite.product_id} favorite={favorite} index={index} />
              ))}
            </motion.div>
          ) : (
            /* Enhanced Empty State */
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: [
                    "0 10px 25px rgba(0,0,0,0.1)",
                    "0 20px 40px rgba(0,0,0,0.15)",
                    "0 10px 25px rgba(0,0,0,0.1)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-12 h-12 text-gray-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No favorites yet
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Start exploring our Nike collection and add products to your favorites.
              </p>
              <motion.button
                onClick={() => navigate('/shop')}
                className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Size Selection Modal */}
      <SizeSelectionModal />
    </div>
  );
};

export default Favorites; 