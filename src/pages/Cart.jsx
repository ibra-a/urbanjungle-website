import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { state, actions } = useApp();
  const { cart } = state;
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [favoriteStates, setFavoriteStates] = useState({}); // Track favorite state for each item
  const [loadingStates, setLoadingStates] = useState({}); // Track loading state for each item

  // Check favorites status for all cart items when component mounts
  useEffect(() => {
    if (state.isAuthenticated && cart.items.length > 0) {
      checkFavoritesStatus();
    }
  }, [state.isAuthenticated, cart.items]);

  const checkFavoritesStatus = async () => {
    const token = localStorage.getItem('nike_token');
    if (!token) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const favoriteMap = {};
        
        // Check which cart items are already favorited
        cart.items.forEach(item => {
          const isFavorite = data.favorites.some(
            fav => fav.product_id === item.id
          );
          favoriteMap[item.id] = isFavorite;
        });
        
        setFavoriteStates(favoriteMap);
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity === 0) {
      actions.removeFromCart({ id: item.id, size: item.size });
      toast.success('Item removed from cart');
    } else {
      actions.updateCartQuantity({
        id: item.id,
        size: item.size,
        quantity: newQuantity
      });
    }
  };

  const updateSize = (item, newSize) => {
    // Remove old item and add with new size
    actions.removeFromCart({ id: item.id, size: item.size });
    actions.addToCart({
      ...item,
      size: newSize
    });
    toast.success('Size updated');
  };

  const removeItem = (item) => {
    actions.removeFromCart({ id: item.id, size: item.size });
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const addToFavorites = async (item) => {
    if (!state.isAuthenticated) {
      toast.error('Please sign in to add favorites');
      return;
    }

    const token = localStorage.getItem('nike_token');
    if (!token) return;

    // Set loading state for this specific item
    setLoadingStates(prev => ({ ...prev, [item.id]: true }));

    try {
      const isFavorite = favoriteStates[item.id];
      const url = `http://127.0.0.1:5000/api/favorites/${item.id}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const body = isFavorite ? undefined : JSON.stringify({
        product_name: item.name,
        product_price: item.price
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
        // Update favorite state for this item
        setFavoriteStates(prev => ({ 
          ...prev, 
          [item.id]: !isFavorite 
        }));
        
        // Dispatch event to update navbar favorites
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        
        if (!isFavorite) {
          toast.success('Added to favorites! 🤍');
        } else {
          toast.success('Removed from favorites');
        }
      } else {
        toast.error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      // Clear loading state for this item
      setLoadingStates(prev => ({ ...prev, [item.id]: false }));
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your bag is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your bag yet.</p>
            <Link
              to="/shop"
              className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Free Delivery Banner */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              </div>
              <span className="text-sm text-gray-700">Free delivery for all members.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side - Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-medium text-gray-900 mb-6">Bag</h1>
            
            {/* Free Delivery Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-yellow-800">Free Delivery for Members</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Become an Urban Jungle Member to get fast and free delivery. 
                    {!state.isAuthenticated ? (
                      <>
                        <button 
                          onClick={() => navigate('/', { state: { showLogin: true } })}
                          className="underline ml-1 hover:text-yellow-800"
                        >
                          Join Us
                        </button> or <button 
                          onClick={() => navigate('/', { state: { showLogin: true } })}
                          className="underline hover:text-yellow-800"
                        >
                          Sign In
                        </button>
                      </>
                    ) : (
                      <span className="ml-1 font-medium">You're already a member! ✅</span>
                    )}
                  </p>
                </div>
                <button className="text-yellow-600 hover:text-yellow-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-6">
              {cart.items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.size}`}
                  className="flex items-start space-x-4 py-6 border-b border-gray-200"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {/* Product Image */}
                  <div className="w-36 h-36 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-lg leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 mt-1">{item.category}</p>
                        <p className="text-gray-600">{item.description || 'Black/Black/Metallic Gold'}</p>
                        
                        {/* Size and Quantity Controls */}
                        <div className="flex items-center space-x-6 mt-4">
                          {/* Size Selector */}
                          <div className="relative">
                            <label className="block text-sm text-gray-600 mb-1">Size</label>
                            <select
                              value={item.size}
                              onChange={(e) => updateSize(item, e.target.value)}
                              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Quantity Selector */}
                          <div className="relative">
                            <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                            <select
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item, parseInt(e.target.value))}
                              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-8 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-4 mt-4">
                          <button
                            onClick={() => addToFavorites(item)}
                            disabled={loadingStates[item.id]}
                            className={`flex items-center space-x-1 transition-colors ${
                              favoriteStates[item.id] 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-600 hover:text-black'
                            } ${loadingStates[item.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={favoriteStates[item.id] ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {loadingStates[item.id] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Heart className={`w-4 h-4 ${
                                favoriteStates[item.id] ? 'fill-red-500 text-red-500' : 'fill-none'
                              }`} />
                            )}
                          </button>
                          <button
                            onClick={() => removeItem(item)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right ml-4">
                        <p className="font-medium text-gray-900 text-lg">
                          {(item.price * item.quantity).toLocaleString('fr-DJ')} DJF
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white sticky top-24">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Summary</h2>
              
              {/* Order Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.itemCount} Items)</span>
                  <span className="font-medium">{cart.total.toLocaleString('fr-DJ')} DJF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery & Handling</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-medium text-gray-900">{cart.total.toLocaleString('fr-DJ')} DJF</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(Inclusive of VAT)</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      Delivery fee (if applicable) will be calculated at checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Do You Have A Promo Code?</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter Promo Code"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                onClick={handleCheckout}
                className="w-full relative overflow-hidden group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
                <span className="relative block py-4 text-white font-semibold text-lg tracking-wide">
                  Checkout
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 