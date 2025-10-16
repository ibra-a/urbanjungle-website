import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import FilterSidebar from '../components/FilterSidebar';
import FilterChips from '../components/FilterChips';
import LiveProductCard from '../components/LiveProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { mbappeWhite } from '../assets/images';

const Women = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  // Enhanced filters state
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 2000],
    colors: [],
    sizes: [],
    offers: [],
    sport: ''
  });

  // Fetch women's products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendStatus('connected');
      
      // Fetch all products (gender field is null in database)
      // TODO: Update database to populate gender field, then use: getProductsByGender('WOMEN')
      const response = await apiService.getProducts();
      const allProductsData = response.products || [];
      
      // Filter for women's products if gender is set
      const womenProducts = allProductsData.filter(product => {
        if (product.gender) {
          const gender = product.gender.toUpperCase();
          return gender === 'WOMEN' || gender === 'FEMALE' || gender === 'UNISEX' || gender === 'F' || gender === 'W';
        }
        
        // Show all products (since gender is mostly null)
        return true;
      });
      
      setAllProducts(womenProducts);
      
    } catch (err) {
      setError(err.message);
      setBackendStatus('error');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply all filters whenever dependencies change
  useEffect(() => {
    let filtered = [...allProducts];

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        (product.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.item_group || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== '') {
      filtered = filtered.filter(product =>
        product.category === filters.category
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }

    // Apply colors filter (simplified for now)
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(product =>
        filters.colors.some(color => product.colors.includes(color))
      );
    }

    // Apply sizes filter (simplified for now)  
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product =>
        filters.sizes.some(size => product.sizes.includes(size))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return 0; // No date info yet
        case 'bestseller':
          return b.isBestSeller - a.isBestSeller;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.itemName.localeCompare(b.itemName);
        case 'featured':
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [allProducts, searchQuery, filters, sortBy]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (filterType, newValue) => {
    const updatedFilters = { ...filters };
    updatedFilters[filterType] = newValue;
    setFilters(updatedFilters);
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 2000],
      colors: [],
      sizes: [],
      offers: [],
      sport: ''
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category && filters.category !== '') count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000)) count++;
    if (filters.colors && filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes && filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.offers && filters.offers.length > 0) count += filters.offers.length;
    if (filters.sport && filters.sport !== '') count++;
    return count;
  };

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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Filter Sidebar */}
        <FilterSidebar
          isVisible={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Header Section */}
        <div 
          className="relative h-80 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${mbappeWhite})`,
            backgroundPosition: 'center 20%',
          }}
        >
        </div>

        <div className={`max-container padding transition-all duration-300 ${showFilters ? 'lg:ml-80' : ''}`}>
          <div className="text-white text-2xl mb-6">Loading Women's Collection...</div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="nike-card rounded-2xl overflow-hidden">
                <LoadingSkeleton variant="card" className="h-64 bg-white/10" />
                <div className="p-4 space-y-2">
                  <LoadingSkeleton variant="text" className="bg-white/10" />
                  <LoadingSkeleton variant="title" className="bg-white/10" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Filter Sidebar */}
      <FilterSidebar
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Header Section */}
      <div 
        className="relative h-80 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${mbappeWhite})`,
          backgroundPosition: 'center 20%',
        }}
      >
      </div>

      <div className={`max-container padding transition-all duration-300 ${showFilters ? 'lg:ml-80' : ''}`}>
        {/* Breadcrumb with Backend Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between text-sm text-white/60 mb-6"
        >
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Women's Collection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs">
              {backendStatus === 'connected' ? 'Live ERPNext Data' : 
               backendStatus === 'offline' ? 'Backend Offline' :
               backendStatus === 'error' ? 'Connection Error' : 'Checking...'}
            </span>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div 
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-red-400 font-semibold mb-2">Connection Error</div>
            <div className="text-red-300 text-sm mb-4">{error}</div>
            <div className="flex gap-4">
              <motion.button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                onClick={fetchProducts}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
              <Link 
                to="/shop"
                className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                View All Products
              </Link>
            </div>
            <div className="text-xs text-white/40 mt-3">
              Make sure Flask backend is running: <code>cd backend && python app.py</code>
            </div>
          </motion.div>
        )}

        {/* Results Count & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-6"
        >
          {/* Title and Results Count */}
          <div className="flex-1">
            <h2 className="text-2xl font-palanquin font-bold mb-2">
              Women's Products ({filteredProducts.length})
              {backendStatus === 'connected' && (
                <span className="ml-2 text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  Live Data
                </span>
              )}
            </h2>
          </div>

          {/* Desktop Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Hide/Show Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <SlidersHorizontal size={20} />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-nike-coral text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="flex-1 lg:w-80 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black font-medium placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-nike-coral focus:outline-none"
            >
              <option value="featured" className="bg-black">Featured</option>
              <option value="newest" className="bg-black">Newest</option>
              <option value="bestseller" className="bg-black">Best Sellers</option>
              <option value="price-low" className="bg-black">Price: Low to High</option>
              <option value="price-high" className="bg-black">Price: High to Low</option>
              <option value="name" className="bg-black">Name A-Z</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-nike-coral text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-nike-coral text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mobile Filter Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => setShowFilters(true)}
          className="lg:hidden w-full flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <Filter size={20} />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-nike-coral text-white text-xs px-2 py-1 rounded-full font-semibold">
              {getActiveFilterCount()}
            </span>
          )}
        </motion.button>

        {/* Active Filter Chips */}
        <FilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={clearAllFilters}
        />

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className={`${viewMode === 'list' ? 'w-full' : ''}`}
            >
              <LiveProductCard 
                product={product} 
                className={viewMode === 'list' ? 'flex-row items-center gap-6' : ''}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-2xl font-palanquin font-semibold mb-4">
              No women's products found
            </h3>
            <p className="text-white/70 mb-6">
              Try adjusting your search or filters, or check that your ERPNext inventory has women's items
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={clearAllFilters}
                className="bg-gradient-to-r from-nike-coral to-nike-amber text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Clear All Filters
              </button>
              <Link
                to="/shop"
                className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                View All Products
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Women; 