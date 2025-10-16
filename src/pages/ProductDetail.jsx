import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Star, Info } from 'lucide-react';
import { apiService } from '../services/api';
import { useApp } from '../context/AppContext';
import EnhancedFavoriteButton from '../components/EnhancedFavoriteButton';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { itemCode } = useParams();
  const navigate = useNavigate();
  const { actions } = useApp();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fallback image
  const fallbackImage = "/images/nike-placeholder.png";

  // Size options based on product category
  const getSizeOptions = (itemGroup) => {
    const category = itemGroup?.toLowerCase() || '';
    
    if (category.includes('shoe') || category.includes('boot') || category.includes('sneaker')) {
      // Footwear sizes (EU)
      return ['40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5', '46'];
    } else {
      // Apparel sizes
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const foundProduct = await apiService.getProductByItemCode(itemCode);
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Set default size from product sizes or use defaults
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          setSelectedSize(foundProduct.sizes[0].size || foundProduct.sizes[0]);
        } else {
          const sizes = getSizeOptions(foundProduct.category || foundProduct.subcategory);
          setSelectedSize(sizes[2] || sizes[0]); // Default to M or first available
        }
      } else {
        toast.error('Product not found');
        navigate('/shop');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [itemCode]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (quantity > (product.stock_quantity || 0)) {
      toast.error(`Only ${product.stock_quantity || 0} items in stock`);
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: product.item_code,
        name: product.item_name,
        price: parseFloat(product.price) || 200,
        image: imageError ? fallbackImage : (product.image_url || apiService.getImageUrl(product)),
        quantity: quantity,
        size: selectedSize,
        category: product.item_group || 'Product',
        stock: product.stock_quantity || 0,
        itemCode: product.item_code,
        description: product.description || '',
        isJustAdded: true // Mark as newly added for confirmation display
      };

      actions.addToCart(cartItem);
      
      // 🎯 FORCE CART TO OPEN IMMEDIATELY
      actions.triggerCartOpen();

      // Remove the toast notification - cart dropdown will show the confirmation

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 200;
    return `${numPrice.toLocaleString('fr-DJ')} DJF`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-red"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/shop" className="text-coral-red hover:underline">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  const sizeOptions = getSizeOptions(product.item_group);
  const isFootwear = product.item_group?.toLowerCase().includes('shoe') || 
                    product.item_group?.toLowerCase().includes('boot') || 
                    product.item_group?.toLowerCase().includes('sneaker');

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb Navigation */}
      <div className="max-container py-4">
        <div className="flex items-center gap-2 text-sm text-slate-gray">
          <Link to="/" className="hover:text-coral-red">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-coral-red">Shop</Link>
          <span>/</span>
          <span className="text-slate-900">{product.item_name}</span>
        </div>
      </div>

      {/* Main Product Content */}
      <div className="max-container">
        <div className="grid lg:grid-cols-2 gap-12 py-8">
          
          {/* Left - Product Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-24">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                {!imageError && product.item_code ? (
                  <img 
                    src={apiService.getImageUrl(product.item_code)}
                    alt={product.item_name}
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <img 
                    src={fallbackImage}
                    alt={product.item_name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              {/* Live Data Badge */}
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Live Data
              </div>
            </div>
          </motion.div>

          {/* Right - Product Details */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            
            {/* Member Access Badge */}
            <div className="text-coral-red text-sm font-semibold">
              Member Access
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold font-palanquin text-slate-900 mb-2">
                {product.item_name}
              </h1>
              <p className="text-lg text-slate-gray">
                {product.item_group}
              </p>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </div>

            {/* Product Code & Stock */}
            <div className="flex items-center gap-4 text-sm text-slate-gray">
              <span>Code: {product.item_code}</span>
              <span>•</span>
              <span className={product.stock_quantity > 10 ? 'text-green-600' : product.stock_quantity > 0 ? 'text-orange-600' : 'text-red-600'}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Select Size</h3>
                <button className="text-coral-red text-sm hover:underline flex items-center gap-1">
                  <Info size={14} />
                  Size Guide
                </button>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`aspect-square border rounded-lg font-semibold text-sm transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-coral-red bg-coral-red text-white'
                        : 'border-gray-300 hover:border-coral-red'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              {isFootwear && (
                <p className="text-xs text-slate-gray">EU sizes shown</p>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-3 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= product.stock_quantity}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-slate-gray">
                  Max: {product.stock_quantity}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
            <motion.button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_quantity === 0 || !selectedSize}
              className="w-full relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: product.stock_quantity > 0 && selectedSize ? 1.02 : 1 }}
              whileTap={{ scale: product.stock_quantity > 0 && selectedSize ? 0.98 : 1 }}
            >
              <div className={`absolute inset-0 rounded-full ${
                product.stock_quantity === 0 || !selectedSize
                  ? 'bg-gray-300'
                  : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500'
              }`}></div>
              <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 ${
                product.stock_quantity > 0 && selectedSize ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500' : ''
              }`}></div>
              <span className={`relative flex items-center justify-center gap-2 py-4 px-8 font-semibold text-lg tracking-wide ${
                product.stock_quantity === 0 || !selectedSize ? 'text-gray-500' : 'text-white'
              }`}>
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </>
                  ) : product.stock_quantity === 0 ? (
                    'Out of Stock'
                  ) : !selectedSize ? (
                    'Select Size'
                  ) : (
                    'Add to Cart'
                  )}
                </span>
              </motion.button>

              <EnhancedFavoriteButton product={product} />
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-lg">Product Details</h3>
                <p className="text-slate-gray leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Delivery Info */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-lg">Free Delivery and Returns</h3>
              <ul className="text-sm text-slate-gray space-y-1">
                <li>• Free returns within 30 days</li>
                <li>• Free delivery on all orders for members</li>
                <li>• Order delivery usually within 1-3 working days</li>
              </ul>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 