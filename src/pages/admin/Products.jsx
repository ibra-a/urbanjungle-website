import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { supabase } from '../../services/supabase';
import { RefreshCw, AlertTriangle, Package, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 20; // Optimized for smooth scrolling

// Memoized Product Row Component for better performance
const ProductRow = memo(({ product, isExpanded, onToggle, showStore }) => {
  // Get store name from warehouse
  const getStoreName = (warehouse) => {
    if (warehouse === 'TH & CK - GFH') return 'Tommy CK';
    if (warehouse === 'UJ - GFH') return 'Urban Jungle';
    return warehouse || 'N/A';
  };
  
  const getStoreColor = (warehouse) => {
    if (warehouse === 'TH & CK - GFH') return 'bg-red-900/50 text-red-300 border-red-700';
    if (warehouse === 'UJ - GFH') return 'bg-green-900/50 text-green-300 border-green-700';
    return 'bg-gray-900/50 text-gray-300 border-gray-700';
  };
  
  return (
    <>
      <tr 
        className="hover:bg-gray-700/50 cursor-pointer transition-colors duration-200"
        onClick={onToggle}
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            {product.variants_count > 1 && (
              isExpanded ? 
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> :
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-sm text-white">
                {product.product_name || product.item_name}
              </span>
            </div>
          </div>
        </td>
        <td className="p-4 text-sm text-gray-400 font-mono">{product.item_code}</td>
        {showStore && (
          <td className="p-4">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStoreColor(product.warehouse)}`}>
              {getStoreName(product.warehouse)}
            </span>
          </td>
        )}
        <td className="p-4">
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300 border border-blue-700">
            {product.item_group || 'N/A'}
          </span>
        </td>
        <td className="p-4 text-sm text-gray-300">{product.brand || 'N/A'}</td>
        <td className="p-4">
          <div className="text-sm text-gray-300">
            <span className="font-semibold">{product.variants_count || 1}</span>
            <div className="text-xs text-gray-500 mt-1">
              {product.colors?.length > 0 && `${product.colors.length} colors`}
              {product.colors?.length > 0 && product.sizes?.length > 0 && ' • '}
              {product.sizes?.length > 0 && `${product.sizes.length} sizes`}
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className={`font-bold text-sm ${
            product.stock_quantity === 0 ? 'text-red-400' :
            product.stock_quantity < 10 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {product.stock_quantity}
          </span>
        </td>
        <td className="p-4 font-medium text-sm text-white">{product.price?.toLocaleString() || 0} DJF</td>
        <td className="p-4">
          {product.stock_quantity === 0 ? (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 border border-red-700">
              Out of Stock
            </span>
          ) : product.stock_quantity < 10 ? (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-700">
              Low Stock
            </span>
          ) : (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900/50 text-green-300 border border-green-700">
              In Stock
            </span>
          )}
        </td>
      </tr>
      
      {/* Expanded Variants Row */}
      {isExpanded && product.all_variants && product.all_variants.length > 1 && (
        <tr>
          <td colSpan={showStore ? "9" : "8"} className="p-0 bg-gray-900/50">
            <div className="p-6 animate-fadeIn">
              <div className="flex items-start gap-6 mb-6">
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <img 
                    src={product.image_url || '/placeholder.png'} 
                    alt={product.product_name || product.item_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {product.product_name || product.item_name}
                  </h4>
                  <p className="text-sm text-gray-400 mb-1">Item Code: {product.item_code}</p>
                  <p className="text-sm text-gray-400">All Variants ({product.variants_count})</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.all_variants
                  .sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
                  .map((variant, idx) => (
                  <div 
                    key={`${variant.item_code}-${variant.color}-${variant.size}-${idx}`}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {variant.color && (
                            <span className="text-sm font-medium text-blue-400">
                              {variant.color}
                            </span>
                          )}
                          {variant.size && (
                            <span className="text-sm font-medium text-purple-400">
                              Size: {variant.size}
                            </span>
                          )}
                        </div>
                        {variant.item_code && (
                          <div className="text-xs text-gray-500 font-mono">
                            {variant.item_code}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          variant.stock_quantity === 0 ? 'text-red-400' :
                          variant.stock_quantity < 10 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {variant.stock_quantity || 0}
                        </div>
                        <div className="text-xs text-gray-500">in stock</div>
                      </div>
                    </div>
                    
                    {variant.price && (
                      <div className="text-sm text-gray-300 mt-2 pt-2 border-t border-gray-700">
                        {variant.price.toLocaleString()} DJF
                      </div>
                    )}
                    
                    {idx === 0 && variant.stock_quantity > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                          🔥 Best Seller
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

ProductRow.displayName = 'ProductRow';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [itemGroupFilter, setItemGroupFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [itemGroups, setItemGroups] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all'); // Apparel, Accessories, Footwear
  const [storeFilter, setStoreFilter] = useState('all'); // 'all', 'tommy', or 'urban'
  
  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);
  
  // Reload filters when store changes
  useEffect(() => {
    if (hasAppliedFilter) {
      // Clear existing filters first
      setBrands([]);
      setItemGroups([]);
      setProducts([]);
      // Then reload
      loadFilterOptions();
      loadProducts();
    }
  }, [storeFilter]);
  
  // Only load products when filters are applied
  useEffect(() => {
    if (hasAppliedFilter) {
      loadProducts();
    }
  }, [filter, brandFilter, itemGroupFilter, categoryFilter, storeFilter, hasAppliedFilter]);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const loadFilterOptions = async () => {
    try {
      // Always query the master products table
      const { data, error } = await supabase
        .from('products')
        .select('brand, item_group')
        .limit(2000); // Increased limit for all products
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No products found in database');
        toast.error('No products found. Please sync products from ERP first.');
        setFiltersLoaded(true);
        return;
      }
      
      const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))];
      const uniqueItemGroups = [...new Set(data.map(p => p.item_group).filter(Boolean))];
      
      console.log('=== FILTER OPTIONS LOADED ===');
      console.log('Store filter:', storeFilter);
      console.log('Source: products (master table)');
      console.log('Brands found:', uniqueBrands);
      console.log('Item Groups found:', uniqueItemGroups);
      console.log('===========================');
      
      setBrands(uniqueBrands.sort());
      setItemGroups(uniqueItemGroups.sort());
      setFiltersLoaded(true);
    } catch (error) {
      console.error('Error loading filters:', error);
      toast.error(`Failed to load filter options: ${error.message || 'Unknown error'}`);
      setFiltersLoaded(true); // Still show UI even if filters fail
    }
  };
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Always query the master products table
      let query = supabase
        .from('products')
        .select('*');
      
      // Store filter based on warehouse
      if (storeFilter === 'tommy') {
        query = query.eq('warehouse', 'TH & CK - GFH');
      } else if (storeFilter === 'urban') {
        query = query.eq('warehouse', 'UJ - GFH');
      }
      // If storeFilter === 'all', don't filter by warehouse (show all)
      
      // Brand filter
      if (brandFilter !== 'all') {
        query = query.eq('brand', brandFilter);
      }
      
      // Category filter (Apparel, Accessories, Footwear)
      if (categoryFilter !== 'all') {
        query = query.ilike('item_group', `${categoryFilter}%`);
      }
      
      // Item Group filter (specific sub-categories)
      if (itemGroupFilter !== 'all') {
        query = query.eq('item_group', itemGroupFilter);
      }
      
      // Stock filter
      if (filter === 'low_stock') {
        query = query.lt('stock_quantity', 10).gt('stock_quantity', 0);
      } else if (filter === 'out_of_stock') {
        query = query.eq('stock_quantity', 0);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group products by item_code (removes size/color duplicates)
      const groupedProducts = {};
      (data || []).forEach(product => {
        const key = product.item_code;
        if (!groupedProducts[key]) {
          groupedProducts[key] = {
            ...product,
            total_stock: product.stock_quantity || 0,
            variants_count: 1,
            colors: product.color ? [product.color] : [],
            sizes: product.size ? [product.size] : [],
            all_variants: [product] // Store all variants for expansion
          };
        } else {
          // Accumulate stock from all variants
          groupedProducts[key].total_stock += product.stock_quantity || 0;
          groupedProducts[key].variants_count += 1;
          groupedProducts[key].all_variants.push(product);
          if (product.color && !groupedProducts[key].colors.includes(product.color)) {
            groupedProducts[key].colors.push(product.color);
          }
          if (product.size && !groupedProducts[key].sizes.includes(product.size)) {
            groupedProducts[key].sizes.push(product.size);
          }
        }
      });
      
      let productsList = Object.values(groupedProducts).map(p => ({
        ...p,
        stock_quantity: p.total_stock // Use total stock for display
      }));
      
      // Apply stock filter AFTER grouping
      if (filter === 'low_stock') {
        productsList = productsList.filter(p => p.stock_quantity < 10 && p.stock_quantity > 0);
      } else if (filter === 'out_of_stock') {
        productsList = productsList.filter(p => p.stock_quantity === 0);
      }
      
      // Sort order: All Products = highest stock first, others = lowest stock first
      if (filter === 'all') {
        productsList.sort((a, b) => b.stock_quantity - a.stock_quantity);
      } else {
        productsList.sort((a, b) => a.stock_quantity - b.stock_quantity);
      }
      
      setProducts(productsList);
      
      const low = productsList.filter(p => p.stock_quantity < 10 && p.stock_quantity > 0) || [];
      setLowStock(low);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  const syncProducts = () => {
    // Show instructions for manual sync in local development
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      toast.error(
        '🔧 Running locally. Please run sync in terminal:\n\nnpm run sync:all\n\nThen refresh this page.',
        { duration: 8000 }
      );
      console.log(`
╔════════════════════════════════════════╗
║   Manual Sync Required (Local Dev)    ║
╠════════════════════════════════════════╣
║                                        ║
║  Run in your terminal:                 ║
║                                        ║
║  npm run sync:all                      ║
║                                        ║
║  This will sync:                       ║
║  1. All products to master table       ║
║  2. Filter to store-specific tables    ║
║                                        ║
║  Then refresh this admin page          ║
║                                        ║
╚════════════════════════════════════════╝
      `);
    } else {
      // Production: Call API endpoint
      syncProductsAPI();
    }
  };
  
  const syncProductsAPI = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Products synced successfully from ERPNext!');
        loadProducts();
      } else {
        toast.error(result.error || 'Failed to sync products');
        console.error('Sync error details:', result);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };
  
  // Search filter - Memoized for performance
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    
    const searchLower = debouncedSearch.toLowerCase();
    return products.filter(p => 
      (p.product_name?.toLowerCase().includes(searchLower)) ||
      (p.item_name?.toLowerCase().includes(searchLower)) ||
      (p.item_code?.toLowerCase().includes(searchLower)) ||
      (p.brand?.toLowerCase().includes(searchLower))
    );
  }, [products, debouncedSearch]);
  
  // Pagination - Memoized
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return { totalPages, startIndex, endIndex, paginatedProducts };
  }, [filteredProducts, currentPage]);
  
  const { totalPages, startIndex, endIndex, paginatedProducts } = paginationData;
  
  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, brandFilter, itemGroupFilter]);
  
  // Memoized toggle function
  const toggleExpand = useCallback((itemCode) => {
    setExpandedProduct(prev => prev === itemCode ? null : itemCode);
  }, []);
  
  // Apply filters and load products
  const applyFilters = () => {
    // Allow "all" to show all GAB Fashion House products (Tommy + CK)
    setHasAppliedFilter(true);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStoreFilter('all'); // Default to showing ALL products
    setBrandFilter('all');
    setItemGroupFilter('all');
    setCategoryFilter('all');
    setFilter('all');
    setSearchQuery('');
    setProducts([]);
    setHasAppliedFilter(false);
  };
  
  // Show filter selection screen if no filters applied
  if (!hasAppliedFilter) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-2xl w-full p-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h1 className="text-3xl font-bold text-white mb-2">Products Management</h1>
              <p className="text-gray-400">Select filters to view and manage your inventory</p>
            </div>
            
            {!filtersLoaded ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading filter options...</p>
              </div>
            ) : brands.length === 0 && itemGroups.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
                <p className="text-gray-400 mb-6">
                  Please sync products from ERPNext first to view inventory.
                </p>
                <button
                  onClick={syncProducts}
                  disabled={syncing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600"
                >
                  <RefreshCw className={`w-4 h-4 inline mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync from ERP'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Store View Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select View <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    {/* All GAB Products - DEFAULT */}
                    <button
                      onClick={() => {
                        setStoreFilter('all');
                        setBrandFilter('all');
                        setCategoryFilter('all');
                      }}
                      className={`p-6 rounded-lg font-bold transition-all ${
                        storeFilter === 'all'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                          : 'bg-gray-700 border-2 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">🏢</div>
                      <div className="text-xl">All GAB Fashion House Products</div>
                      <div className="text-xs opacity-75 mt-1">Complete inventory - All stores & brands</div>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Tommy CK Site */}
                      <button
                        onClick={() => {
                          setStoreFilter('tommy');
                          setBrandFilter('all');
                          setCategoryFilter('all');
                        }}
                        className={`p-6 rounded-lg font-bold transition-all ${
                          storeFilter === 'tommy'
                            ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-xl scale-105'
                            : 'bg-gray-700 border-2 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">🔴</div>
                        <div className="text-lg">Tommy CK Site</div>
                        <div className="text-xs opacity-75 mt-1">Tommy & Calvin Klein only</div>
                      </button>
                      
                      {/* Urban Jungle Site */}
                      <button
                        onClick={() => {
                          setStoreFilter('urban');
                          setBrandFilter('all');
                          setCategoryFilter('all');
                        }}
                        className={`p-6 rounded-lg font-bold transition-all ${
                          storeFilter === 'urban'
                            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-xl scale-105'
                            : 'bg-gray-700 border-2 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">🌿</div>
                        <div className="text-lg">Urban Jungle Site</div>
                        <div className="text-xs opacity-75 mt-1">Nike, Adidas, Jordan, etc.</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Brand Filter (Optional - for specific brands within selection) */}
                {brands.length > 2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Filter by Specific Brand (Optional)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                      <button
                        onClick={() => setBrandFilter('all')}
                        className={`p-2 rounded text-xs font-medium transition-all ${
                          brandFilter === 'all'
                            ? 'bg-white text-black'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        All Brands
                      </button>
                      {brands.filter(b => b !== 'TOMMY HILFIGER' && b !== 'CALVIN KLEIN').map(brand => (
                        <button
                          key={brand}
                          onClick={() => setBrandFilter(brand)}
                          className={`p-2 rounded text-xs font-medium transition-all ${
                            brandFilter === brand
                              ? 'bg-white text-black'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Stock Status (Optional)
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFilter('all')}
                      className={`flex-1 p-3 rounded-lg font-medium transition-all ${
                        filter === 'all'
                          ? 'bg-white text-black'
                          : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      All Stock
                    </button>
                    <button
                      onClick={() => setFilter('low_stock')}
                      className={`flex-1 p-3 rounded-lg font-medium transition-all ${
                        filter === 'low_stock'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Low Stock
                    </button>
                    <button
                      onClick={() => setFilter('out_of_stock')}
                      className={`flex-1 p-3 rounded-lg font-medium transition-all ${
                        filter === 'out_of_stock'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={applyFilters}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl"
                >
                  Load Products →
                </button>
                
                <p className="text-xs text-gray-400 text-center">
                  Select a store option above to view products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gray-900 pb-4 mb-6 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Products Management</h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-400">
                {storeFilter === 'all' ? (
                  <span className="text-purple-400 font-semibold">🏢 All GAB Fashion House Products</span>
                ) : storeFilter === 'tommy' ? (
                  <span className="text-red-400 font-semibold">🔴 Tommy CK Site</span>
                ) : (
                  <span className="text-green-400 font-semibold">🌿 Urban Jungle Site</span>
                )}
                {brandFilter !== 'all' && (
                  <span className="text-gray-500"> • <span className="text-white">{brandFilter}</span></span>
                )}
                {categoryFilter !== 'all' && (
                  <span className="text-gray-500"> • <span className="text-blue-400">{categoryFilter}</span></span>
                )}
              </p>
              <button
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-white underline"
              >
                Change View
              </button>
            </div>
          </div>
          <button 
            onClick={syncProducts}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync ERP'}
          </button>
        </div>
      </div>
      
      {/* Search Box */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, item code, or brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && filter === 'all' && !searchQuery && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{lowStock.length} items low in stock!</span>
            <button 
              onClick={() => setFilter('low_stock')}
              className="ml-auto text-sm underline hover:no-underline"
            >
              View all
            </button>
          </div>
        </div>
      )}
      
      {/* Active Filters Bar */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="space-y-3">
          {/* First Row: Stock & Brand */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500 font-medium w-20">Stock:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-white text-black' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('low_stock')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filter === 'low_stock' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filter === 'out_of_stock' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {/* Second Row: Category */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500 font-medium w-20">Category:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  categoryFilter === 'all' 
                    ? 'bg-white text-black' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('Apparel')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  categoryFilter === 'Apparel' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                👕 Apparel
              </button>
              <button
                onClick={() => setCategoryFilter('Accessories')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  categoryFilter === 'Accessories' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                👜 Accessories
              </button>
              <button
                onClick={() => setCategoryFilter('Footwear')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  categoryFilter === 'Footwear' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                👟 Footwear
              </button>
            </div>
          </div>

          {/* Third Row: Brand - Dynamic based on store */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500 font-medium w-20">Brand:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBrandFilter('all')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  brandFilter === 'all' 
                    ? 'bg-white text-black' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                All Brands
              </button>
              {brands.slice(0, 10).map(brand => {
                // Get brand color based on name
                const getBrandColor = (brandName) => {
                  if (brandName === 'TOMMY HILFIGER') return 'bg-red-600';
                  if (brandName === 'CALVIN KLEIN') return 'bg-gray-900 border border-white';
                  if (brandName === 'NIKE') return 'bg-yellow-600';
                  if (brandName === 'URBAN JUNGLE' || brandName === 'URBAN') return 'bg-green-600';
                  if (brandName === 'ADIDAS') return 'bg-blue-600';
                  if (brandName === 'JORDAN') return 'bg-red-700';
                  if (brandName === 'CONVERSE') return 'bg-purple-600';
                  return 'bg-gray-600';
                };
                
                // Shorten brand name for display
                const getDisplayName = (brandName) => {
                  if (brandName === 'TOMMY HILFIGER') return 'Tommy';
                  if (brandName === 'CALVIN KLEIN') return 'CK';
                  return brandName;
                };
                
                return (
                  <button
                    key={brand}
                    onClick={() => setBrandFilter(brand)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      brandFilter === brand 
                        ? `${getBrandColor(brand)} text-white` 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {getDisplayName(brand)}
                  </button>
                );
              })}
              {brands.length > 10 && (
                <span className="px-3 py-1.5 text-xs text-gray-500">
                  +{brands.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      {loading ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center">
          <div className="text-gray-400">Loading products...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No products found</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Product</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Item Code</th>
                    {storeFilter === 'all' && (
                      <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Store</th>
                    )}
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Product Line</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Brand</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Variants</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Total Stock</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Price</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedProducts.map(product => (
                    <ProductRow
                      key={product.item_code}
                      product={product}
                      isExpanded={expandedProduct === product.item_code}
                      onToggle={() => toggleExpand(product.item_code)}
                      showStore={storeFilter === 'all'}
                    />
                  ))}
                </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 gap-4">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              {debouncedSearch && ` (filtered from ${products.length})`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  // Show first 3, current page neighbors, and last 3
                  const page = i + 1;
                  if (totalPages <= 10) {
                    return page;
                  }
                  if (page <= 3 || page > totalPages - 3 || Math.abs(page - currentPage) <= 1) {
                    return page;
                  }
                  if (page === 4 && currentPage > 5) return '...';
                  if (page === totalPages - 3 && currentPage < totalPages - 4) return '...';
                  return null;
                }).filter(Boolean).map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-[40px] rounded font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-white text-black'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </>
      )}
      
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-4 text-sm text-gray-400 text-center">
          Total: {filteredProducts.length} products
          {debouncedSearch && ` (filtered from ${products.length} products)`}
        </div>
      )}
    </div>
  );
};

export default Products;

