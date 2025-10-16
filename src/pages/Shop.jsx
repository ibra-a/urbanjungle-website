import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Search, Filter, Grid, List, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LiveProductCard from '../components/LiveProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendStatus('connected');
      
      // Fetch products directly (no health check needed - wastes time)
      const response = await apiService.getProducts();
      const fetchedProducts = response.products || [];
      
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setBackendStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.item_group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.item_group?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.item_name || '').localeCompare(b.item_name || '');
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'stock':
          return (b.stock_quantity || 0) - (a.stock_quantity || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Extract unique categories from item_group
  const categories = ['all', ...new Set(products.map(p => {
    const group = p.item_group || '';
    // Extract category part (e.g., "Footwear" from "Footwear - Urban Jungle")
    return group.split(' - ')[0]?.toLowerCase();
  }).filter(Boolean))];

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" ref={ref}>
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b sticky top-0 z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-container py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 text-slate-gray hover:text-coral-red transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-montserrat">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-sm font-montserrat text-slate-gray">
                  {backendStatus === 'connected' ? 'Connected to Supabase' : 'Connection Status'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold font-palanquin text-black mb-2">
                Urban Jungle <span className="text-black">Collection</span>
              </h1>
              <p className="text-lg text-slate-600 font-montserrat font-medium">
                {filteredProducts.length} products available
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-montserrat text-black font-medium placeholder-gray-400 bg-white w-full sm:w-64"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-montserrat bg-white text-black font-medium"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-red focus:border-transparent outline-none font-montserrat bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock Level</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-coral-red text-white' : 'bg-white text-slate-gray'} transition-colors`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-coral-red text-white' : 'bg-white text-slate-gray'} transition-colors`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-container py-8">
        {loading && (
          <motion.div 
            className={`grid ${viewMode === 'grid' ? 'lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2' : 'grid-cols-1'} gap-6`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <LoadingSkeleton variant="card" className="h-80" />
                <div className="mt-4 space-y-2">
                  <LoadingSkeleton variant="text" />
                  <LoadingSkeleton variant="title" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-lg p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-red-600 font-semibold mb-2 text-lg">Connection Error</div>
            <div className="text-red-500 mb-4">{error}</div>
            <motion.button
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-montserrat"
              onClick={fetchProducts}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
            <div className="text-xs text-gray-500 mt-4">
              Make sure your Supabase configuration is correct in the .env file
            </div>
          </motion.div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-palanquin">No products found</h3>
            <p className="text-slate-gray font-montserrat">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <>
            <motion.div 
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1'
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {filteredProducts
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((product, index) => (
                  <motion.div
                    key={product.item_code}
                    variants={itemVariants}
                    custom={index}
                    className={viewMode === 'list' ? 'w-full' : ''}
                  >
                    <LiveProductCard 
                      product={product} 
                      className={viewMode === 'list' ? 'flex-row items-center gap-6' : ''}
                    />
                  </motion.div>
                ))}
            </motion.div>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <motion.div 
                className="flex justify-center items-center gap-4 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed font-montserrat font-medium transition-all duration-300 disabled:hover:bg-transparent disabled:hover:border-gray-200"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[44px] px-4 py-2.5 rounded-xl font-montserrat font-medium transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                                : 'border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed font-montserrat font-medium transition-all duration-300 disabled:hover:bg-transparent disabled:hover:border-gray-200"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop; 