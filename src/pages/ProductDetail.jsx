import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Star, Info, ShoppingCart, X } from 'lucide-react';
import { products as productsApi, supabase, TABLES } from '../services/supabase';
import { useApp } from '../context/AppContext';
import EnhancedFavoriteButton from '../components/EnhancedFavoriteButton';
import toast from 'react-hot-toast';
import { extractBaseName as getBaseProductName } from '../utils/productNameUtils';

const ProductDetail = () => {
  const { itemCode } = useParams();
  const navigate = useNavigate();
  const { actions } = useApp();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fallback image
  const fallbackImage = "/images/uj-placeholder.png";
  
  // Urban Jungle / TommyCK parity:
  // A "base product" (e.g. "Jordan Jumpman Men's T-Shirt") can exist as multiple rows in `urban_products`,
  // one per colorway. On Product Detail we merge those rows to show all colors + sizes in one view.
  // getBaseProductName is imported from '../utils/productNameUtils' (extractBaseName)
  
  const mergeVariantRows = (variantRows, baseName, preferredItemCode = null) => {
    const rows = Array.isArray(variantRows) ? variantRows : [];
    if (rows.length === 0) return null;
    
    // Prefer the row matching the SKU that the user clicked (for price/description defaults)
    const preferred = preferredItemCode
      ? rows.find(r => r.item_code === preferredItemCode) || rows[0]
      : rows[0];
    
    // Merge colors across rows (dedupe by code -> color)
    const colorMap = new Map();
    for (const row of rows) {
      const rowColors = Array.isArray(row.colors) ? row.colors : [];
      for (const c of rowColors) {
        const code = (c && typeof c === 'object') ? (c.code || c.color) : c;
        const key = (code || '').toString().trim().toLowerCase() || (c?.color || '').toString().trim().toLowerCase();
        if (!key) continue;
        if (!colorMap.has(key)) {
          colorMap.set(key, c);
        } else {
          // Merge stock + prefer image_url when missing
          const existing = colorMap.get(key);
          if (existing && typeof existing === 'object' && c && typeof c === 'object') {
            existing.stock = (existing.stock || 0) + (c.stock || 0);
            existing.available = (existing.stock || 0) > 0;
            if (!existing.image_url && c.image_url) existing.image_url = c.image_url;
            if (!existing.code && c.code) existing.code = c.code;
            if (!existing.color && c.color) existing.color = c.color;
          }
        }
      }
    }
    const mergedColors = Array.from(colorMap.values());
    
    // Merge sizes across rows (keep per-color sizes; ensure color_code and item_code are present)
    const mergedSizes = [];
    for (const row of rows) {
      const rowSizes = Array.isArray(row.sizes) ? row.sizes : [];
      const rowPrimaryColor = Array.isArray(row.colors) && row.colors[0] && typeof row.colors[0] === 'object'
        ? row.colors[0]
        : null;
      const fallbackColorCode = rowPrimaryColor?.code || null;
      
      for (const s of rowSizes) {
        if (!s || typeof s !== 'object') continue;
        mergedSizes.push({
          ...s,
          // If missing, infer from row context
          color_code: s.color_code || fallbackColorCode || null,
          item_code: s.item_code || row.item_code || null,
        });
      }
    }
    
    // ✅ NEW: Extract and merge variants[] arrays from all rows (new database structure)
    const mergedVariants = [];
    for (const row of rows) {
      if (row.variants && Array.isArray(row.variants)) {
        for (const variant of row.variants) {
          // Deduplicate variants by color_code + size + item_code
          const key = `${variant.color_code || 'null'}-${variant.size || 'null'}-${variant.item_code || 'null'}`;
          const existing = mergedVariants.find(v => 
            `${v.color_code || 'null'}-${v.size || 'null'}-${v.item_code || 'null'}` === key
          );
          if (!existing) {
            mergedVariants.push(variant);
          } else {
            // Merge stock if duplicate found (shouldn't happen, but safety)
            existing.stock = (existing.stock || 0) + (variant.stock || 0);
            existing.available = (existing.stock || 0) > 0;
          }
        }
      }
    }
    
    // Total stock across colorways (used for top stock badge)
    const totalStock = rows.reduce((sum, r) => sum + (Number(r.stock_quantity) || 0), 0);
    
    return {
      ...preferred,
      // Display as base product name
      item_name: baseName || preferred.item_name || preferred.product_name,
      product_name: baseName || preferred.product_name || preferred.item_name,
      // The merged variant data
      colors: mergedColors,
      sizes: mergedSizes,
      // ✅ NEW: Merged variants[] array (all color+size combinations)
      variants: mergedVariants.length > 0 ? mergedVariants : (preferred.variants || []),
      // Total stock across all colorways
      stock_quantity: totalStock,
    };
  };

  // Size options - use real data from product or fallback to defaults (same as Tommy CK)
  const getSizeOptions = (product) => {
    // ✅ NEW: Use variants[] array if available (new database structure)
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // Extract unique sizes from all variants (across all colors)
      const uniqueSizes = Array.from(new Set(
        product.variants
          .map(v => v.size)
          .filter(size => size != null && size !== '')
      ));
      if (uniqueSizes.length > 0) {
        return uniqueSizes.sort();
      }
    }
    
    // Fallback: If product has sizes from database (old structure), use those
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      // ✅ Deduplicate sizes (safety net against data issues)
      const uniqueSizes = Array.from(new Set(product.sizes.map(s => s.size || s).filter(Boolean)));
      if (uniqueSizes.length > 0) {
        return uniqueSizes.sort();
      }
    }
    
    // Fallback to default sizes based on category
    const category = product?.item_group?.toLowerCase() || '';
    if (category.includes('shoe') || category.includes('boot') || category.includes('sneaker') || category.includes('footwear')) {
      // Footwear sizes (EU)
      return ['40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5', '46'];
    } else {
      // Apparel sizes
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  };
  
  // Get stock for specific size (considering selected color if applicable) - Urban Jungle specific
  const getSizeStock = (size) => {
    if (!product) return 0;
    
    // ✅ NEW: Use variants[] array if available (new database structure)
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // If color is selected, filter variants by color_code
      if (selectedColor && selectedColor.code) {
        const matchingVariant = product.variants.find(v => {
          const sizeMatches = v.size === size;
          const colorMatches = v.color_code === selectedColor.code;
          return sizeMatches && colorMatches;
        });
        return matchingVariant ? (matchingVariant.stock || 0) : 0;
      }
      
      // No color selected: sum stock for this size across all colors
      const sizeVariants = product.variants.filter(v => v.size === size);
      return sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    
    // Fallback: If color is selected, filter sizes by color_code (old structure)
    if (selectedColor && product.sizes && Array.isArray(product.sizes)) {
      const sizeData = product.sizes.find(s => {
        const sizeMatches = (s.size || s) === size;
        const colorMatches = !s.color_code || s.color_code === selectedColor.code || 
                            s.color_code === selectedColor.color;
        return sizeMatches && colorMatches;
      });
      return sizeData ? (sizeData.stock || 0) : 0;
    }
    
    // If product has size-specific stock data (no color selected, old structure)
    if (product.sizes && Array.isArray(product.sizes)) {
      // Sum stock for this size across all colors
      const sizeEntries = product.sizes.filter(s => (s.size || s) === size);
      return sizeEntries.reduce((sum, s) => sum + (s.stock || 0), 0);
    }
    
    // Fallback to total stock
    return product.stock_quantity || 0;
  };
  
  // Check if size is available
  const isSizeAvailable = (size) => {
    return getSizeStock(size) > 0;
  };
  
  // Get available colors - deduplicate by code to prevent duplicates
  const getColorOptions = () => {
    if (product?.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      // Deduplicate colors by code (prevent same color showing multiple times)
      const uniqueColors = [];
      const seenCodes = new Set();
      
      for (const color of product.colors) {
        const code = color.code || color.color;
        if (!seenCodes.has(code)) {
          seenCodes.add(code);
          uniqueColors.push(color);
        }
      }
      
      return uniqueColors;
    }
    return [];
  };
  
  // Get stock for selected color
  const getColorStock = (colorObj) => {
    return colorObj?.stock || 0;
  };
  
  // Get image for selected color
  const getColorImage = (colorObj) => {
    return colorObj?.image_url || product?.image_url;
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const slug = decodeURIComponent(itemCode);
      
      console.log(`🔍 Fetching product: ${slug}`);
      let found = null;
      
      // Prefer exact item_code lookup first (fast + accurate)
      try {
        const { data: exact, error: exactError } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('item_code', slug)
          .maybeSingle();
        
        if (exactError) {
          console.warn('⚠️ Exact item_code lookup failed, falling back to search:', exactError);
        } else {
          found = exact || null;
        }
      } catch (e) {
        console.warn('⚠️ Exact item_code lookup exception, falling back to search:', e);
      }
      
      // Fallback: search (legacy behavior)
      if (!found) {
        const { data, error } = await productsApi.search(slug);
        if (error) {
          console.error('❌ Search error:', error);
          throw error;
        }
        console.log(`📦 Found ${data?.length || 0} products matching search`);
        found = data?.find(p => p.item_code === slug) || null;
      }
      
      if (!found) {
        console.warn(`⚠️ Product not found: ${slug}`);
        toast.error('Product not found');
        navigate('/shop');
        return;
      }
      
      console.log('✅ Product found:', {
        item_code: found.item_code,
        item_name: found.item_name || found.product_name,
        hasColors: Array.isArray(found.colors) && found.colors.length > 0,
        hasSizes: Array.isArray(found.sizes) && found.sizes.length > 0,
        colorsCount: found.colors?.length || 0,
        sizesCount: found.sizes?.length || 0
      });
      
      // Merge: fetch all colorways that share the same base name
      const baseName = getBaseProductName(found.product_name || found.item_name);
      let merged = null;
      
      if (baseName) {
        const { data: variants, error: variantsError } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('is_active', true)
          .ilike('product_name', `${baseName}%`)
          .order('created_at', { ascending: false })
          .limit(200);
        
        if (variantsError) {
          console.warn('⚠️ Failed to fetch base product variants, using single row:', variantsError);
          merged = mergeVariantRows([found], baseName, found.item_code);
        } else {
          merged = mergeVariantRows(variants || [found], baseName, found.item_code);
        }
      } else {
        merged = mergeVariantRows([found], '', found.item_code);
      }
      
      if (!merged) {
        toast.error('Failed to load product variants');
        navigate('/shop');
        return;
      }
      
      setProduct(merged);
      
      // Select the clicked SKU's color first (best UX), otherwise first available
      const mergedColors = Array.isArray(merged.colors) ? merged.colors : [];
      let preferredColor = null;
      if (Array.isArray(found.colors) && found.colors[0]) {
        const clickedColor = found.colors[0];
        const clickedKey = (clickedColor.code || clickedColor.color || '').toString().trim().toLowerCase();
        preferredColor = mergedColors.find(c => (c.code || c.color || '').toString().trim().toLowerCase() === clickedKey) || null;
      }
      const firstAvailableColor = mergedColors.find(c => c && (c.available === undefined ? true : c.available) && (Number(c.stock) || 0) > 0);
      const selectedColorObj = preferredColor || firstAvailableColor || mergedColors[0] || null;
      setSelectedColor(selectedColorObj);
      console.log(`🎨 Selected color: ${selectedColorObj?.color || 'none'}`);
      
      // Pick first available size for selected color
      const sizeOptions = getSizeOptions(merged);
      const getSizeStockFor = (prod, size, colorObj) => {
        // ✅ NEW: Use variants[] array if available (new database structure)
        if (prod?.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
          if (colorObj?.code) {
            const matchingVariant = prod.variants.find(v => 
              v.size === size && v.color_code === colorObj.code
            );
            return matchingVariant ? (matchingVariant.stock || 0) : 0;
          } else {
            // No color selected: sum stock for this size across all colors
            const sizeVariants = prod.variants.filter(v => v.size === size);
            return sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
          }
        }
        
        // Fallback: Use sizes[] array (old structure)
        if (!prod || !Array.isArray(prod.sizes)) return 0;
        const code = colorObj?.code || null;
        const entry = prod.sizes.find(s => {
          const sizeMatches = (s.size || s) === size;
          if (!sizeMatches) return false;
          if (!code) return true;
          return !s.color_code || s.color_code === code;
        });
        return entry ? (entry.stock || 0) : 0;
      };
      
      const firstAvailableSize = sizeOptions.find(size => getSizeStockFor(merged, size, selectedColorObj) > 0);
      setSelectedSize(firstAvailableSize || sizeOptions[0] || '');
    } catch (error) {
      console.error('❌ Error fetching product:', error);
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

    // Get stock for selected size (same as Tommy CK)
    const availableStock = getSizeStock(selectedSize);
    
    if (availableStock === 0) {
      toast.error(`Size ${selectedSize} is out of stock`);
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available for purchase`);
      return;
    }

    setIsAddingToCart(true);

    try {
      // Use color-specific image if color is selected, otherwise use default (same as Tommy CK)
      const colorImage = selectedColor ? getColorImage(selectedColor) : null;
      const primaryImage = (!imageError && (colorImage || product.image_url || (Array.isArray(product.images) && product.images[0]) || product.image)) || fallbackImage;
      
      // IMPORTANT: Use the actual SKU for the selected color+size variant.
      // ✅ NEW: Use variants[] array if available (new database structure)
      let selectedVariant = null;
      let variantItemCode = product.item_code;
      let variantStock = product.stock_quantity;
      
      if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        // Find variant matching selected color and size
        selectedVariant = product.variants.find(v => {
          const sizeMatches = v.size === selectedSize;
          if (!sizeMatches) return false;
          if (!selectedColor?.code) return true;
          return v.color_code === selectedColor.code;
        });
        if (selectedVariant) {
          variantItemCode = selectedVariant.item_code || product.item_code;
          variantStock = selectedVariant.stock || 0;
        }
      } else if (Array.isArray(product.sizes)) {
        // Fallback: Use sizes[] array (old structure)
        selectedVariant = product.sizes.find(s => {
          const sizeMatches = (s.size || s) === selectedSize;
          if (!sizeMatches) return false;
          if (!selectedColor?.code) return true;
          return !s.color_code || s.color_code === selectedColor.code;
        });
        if (selectedVariant) {
          variantItemCode = selectedVariant.item_code || product.item_code;
          variantStock = selectedVariant.stock || 0;
        }
      }
      
      const cartItem = {
        id: variantItemCode,
        name: product.item_name || product.product_name,
        price: Number(product.price) || 0,
        currency: product.currency || 'DJF',
        image: primaryImage,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor ? selectedColor.color : null,
        category: product.item_group || 'General',
        stock: availableStock,
        itemCode: variantItemCode,
        description: product.description || '',
        isJustAdded: true
      };

      actions.addToCart(cartItem);
      
      // Show success toast notification with close button (same as Tommy CK)
      const sizeMessage = selectedSize ? ` (Size: ${selectedSize})` : '';
      const colorMessage = selectedColor ? ` - ${selectedColor.color}` : '';
      const message = `${product.item_name || product.product_name}${colorMessage}${sizeMessage} added to cart!`;
      
      toast.success(message, {
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          padding: '16px 20px',
        },
        duration: 3000,
      });
      
      // 🎯 FORCE CART TO OPEN IMMEDIATELY
      actions.triggerCartOpen();

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const updateQuantity = (newQuantity) => {
    // Get stock for selected size (same as Tommy CK)
    const availableStock = getSizeStock(selectedSize);
    
    if (newQuantity >= 1 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    } else if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} available for size ${selectedSize}`);
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

  const sizeOptions = getSizeOptions(product);
  const colorOptions = getColorOptions();
  const hasColors = colorOptions.length > 0;
  const isFootwear = product.item_group?.toLowerCase().includes('shoe') || 
                    product.item_group?.toLowerCase().includes('boot') || 
                    product.item_group?.toLowerCase().includes('sneaker') ||
                    product.item_group?.toLowerCase().includes('footwear');
  
  // Check if product has size-specific data
  const hasSizeData = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;
  
  // Current display image (use selected color's image if available) - same as Tommy CK
  const displayImage = selectedColor && selectedColor.image_url ? selectedColor.image_url : (product.image_url || (Array.isArray(product.images) && product.images[0]) || product.image);

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
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 py-4 sm:py-6 lg:py-8">
          
          {/* Left - Product Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-24">
              <div className="aspect-square bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg relative group">
                {(!imageError && displayImage) ? (
                  <img 
                    src={displayImage}
                    alt={(product.product_name || product.item_name) + (selectedColor ? ` - ${selectedColor.color}` : '')}
                    className="w-full h-full object-contain p-8 transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={() => setImageError(true)}
                    key={displayImage}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👟</div>
                      <div className="text-slate-400 font-semibold">{product.brand}</div>
                      <div className="text-slate-300 text-sm">{product.item_group}</div>
                    </div>
                  </div>
                )}
                
                {/* Gradient overlay for better image presentation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Live Data Badge */}
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Live Stock
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

            {/* Product Code & Stock - Better visibility (same as Tommy CK) */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm">
                <span className="text-slate-500">SKU:</span>{' '}
                <span className="font-mono font-semibold text-slate-700">{(product.item_code || 'N/A').substring(0, 20)}</span>
              </div>
              <span className="text-slate-300">|</span>
              {(() => {
                const stockQty = product.stock_quantity || 0;
                return (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                    stockQty > 10 
                      ? 'bg-green-100 text-green-700' 
                      : stockQty > 0 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      stockQty > 10 ? 'bg-green-500' : stockQty > 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    {stockQty > 0 ? `${stockQty} in stock` : 'Out of stock'}
                  </div>
                );
              })()}
            </div>

            {/* Color Selection - Tommy CK Style with Urban Jungle Theme */}
            {hasColors && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">Select Color</h3>
                  {selectedColor && (
                    <span className="text-sm font-semibold text-yellow-500">
                      {selectedColor.color}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {colorOptions.map((colorObj) => {
                    const isSelected = selectedColor && selectedColor.color === colorObj.color;
                    const isAvailable = colorObj.available && colorObj.stock > 0;
                    
                    return (
                      <button
                        key={colorObj.color}
                        onClick={() => setSelectedColor(colorObj)}
                        className={`px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 relative min-h-[44px] ${
                          !isAvailable
                            ? 'bg-slate-100 text-slate-400 opacity-50 hover:opacity-70'
                            : isSelected
                            ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black shadow-lg ring-2 ring-yellow-500 ring-offset-2'
                            : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-yellow-500 hover:shadow-md hover:scale-105'
                        }`}
                        title={isAvailable ? `${colorObj.stock} in stock` : 'Out of stock'}
                      >
                        {colorObj.color}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {selectedColor && (
                  <p className="text-sm bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent font-semibold">
                    {selectedColor.stock} units available in {selectedColor.color}
                  </p>
                )}
              </div>
            )}

            {/* Size Selection - Improved styling (Tommy CK style with Urban Jungle theme) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">Select Size</h3>
                <button className="text-yellow-500 text-sm font-semibold hover:text-yellow-400 hover:underline flex items-center gap-1 transition-colors">
                  <Info size={16} />
                  Size Guide
                </button>
              </div>
              
              <div className="grid grid-cols-6 gap-3">
                {sizeOptions.map((size) => {
                  const sizeAvailable = isSizeAvailable(size);
                  const sizeStock = getSizeStock(size);
                  
                  return (
                  <button
                    key={size}
                      onClick={() => sizeAvailable && setSelectedSize(size)}
                      disabled={!sizeAvailable}
                      className={`aspect-square border-2 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 relative min-w-[48px] min-h-[48px] ${
                        !sizeAvailable
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                          : selectedSize === size
                          ? 'border-yellow-500 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/40'
                          : 'border-slate-300 bg-white hover:border-yellow-500 hover:shadow-md text-slate-700 hover:scale-105 active:scale-95'
                      }`}
                      title={sizeAvailable ? `${sizeStock} in stock` : 'Out of stock'}
                  >
                    {size}
                      {!sizeAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-400 rotate-45"></div>
                        </div>
                      )}
                  </button>
                  );
                })}
              </div>
              
              {/* Size Info */}
              <div className="flex items-center justify-between text-sm">
              {isFootwear && (
                  <p className="text-slate-500 font-medium">✓ EU sizes shown</p>
                )}
                {hasSizeData && selectedSize && (
                  <p className="text-yellow-500 font-semibold">
                    {getSizeStock(selectedSize)} in stock for size {selectedSize}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Selection - Better styling (same as Tommy CK) */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Quantity</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center border-2 border-slate-300 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-3 sm:p-4 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} className="text-slate-700" />
                  </button>
                  <span className="px-4 sm:px-6 py-3 font-bold text-lg sm:text-xl min-w-[60px] sm:min-w-[80px] text-center text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= getSizeStock(selectedSize)}
                    className="p-3 sm:p-4 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} className="text-slate-700" />
                  </button>
                </div>
                <div className="text-sm">
                  <div className="text-slate-500">Max available</div>
                  <div className="font-bold text-slate-900">
                    {hasSizeData ? `${getSizeStock(selectedSize)} units (Size ${selectedSize})` : `${product.stock_quantity || 0} units`}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Urban Jungle Theme (Tommy CK style) */}
            <div className="space-y-4 sm:space-y-4 pt-4 sm:pt-6">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedSize || getSizeStock(selectedSize) === 0}
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg min-h-[52px] ${
                  !selectedSize || getSizeStock(selectedSize) === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black hover:shadow-2xl hover:shadow-yellow-500/40 relative overflow-hidden active:scale-98'
                }`}
                whileHover={{ scale: selectedSize && getSizeStock(selectedSize) > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedSize && getSizeStock(selectedSize) > 0 ? 0.98 : 1 }}
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Adding to Cart...
                  </>
                ) : (product.stock_quantity || 0) === 0 ? (
                  <>
                    <X size={20} />
                    Out of Stock
                  </>
                ) : !selectedSize ? (
                  <>
                    <Info size={20} />
                    Please Select Size
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </motion.button>

              <div className="pt-2">
              <EnhancedFavoriteButton product={product} />
              </div>
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