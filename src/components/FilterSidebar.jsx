import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({ 
  isVisible, 
  onClose, 
  filters, 
  onFiltersChange, 
  className = "" 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    colors: true,
    sizes: true,
    offers: true,
    sport: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (filterType === 'category' || filterType === 'sport') {
      newFilters[filterType] = value;
    } else if (filterType === 'colors' || filterType === 'sizes' || filterType === 'offers') {
      if (!newFilters[filterType]) newFilters[filterType] = [];
      
      const index = newFilters[filterType].indexOf(value);
      if (index > -1) {
        newFilters[filterType].splice(index, 1);
      } else {
        newFilters[filterType].push(value);
      }
    } else if (filterType === 'priceRange') {
      newFilters.priceRange = value;
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      priceRange: [0, 2000],
      colors: [],
      sizes: [],
      offers: [],
      sport: ''
    });
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-white/10 pb-6 mb-6">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left mb-4 group"
      >
        <h3 className="text-lg font-palanquin font-semibold text-white group-hover:text-nike-coral transition-colors">
          {title}
        </h3>
        {expandedSections[section] ? (
          <ChevronUp className="text-white/60 group-hover:text-nike-coral transition-colors" size={20} />
        ) : (
          <ChevronDown className="text-white/60 group-hover:text-nike-coral transition-colors" size={20} />
        )}
      </button>
      
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const categories = [
    { value: '', label: 'All Products' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'appareals', label: 'Appareals' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const colors = [
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'red', label: 'Red', hex: '#DC2626' },
    { value: 'blue', label: 'Blue', hex: '#2563EB' },
    { value: 'green', label: 'Green', hex: '#16A34A' },
    { value: 'coral', label: 'Coral', hex: '#FF6B35' },
    { value: 'amber', label: 'Amber', hex: '#FFB627' },
    { value: 'gray', label: 'Gray', hex: '#6B7280' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12', '13'];

  const sports = [
    { value: '', label: 'All Sports' },
    { value: 'running', label: 'Running' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'football', label: 'Football' },
    { value: 'training', label: 'Training & Gym' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'golf', label: 'Golf' }
  ];

  const offers = [
    { value: 'sale', label: 'On Sale' },
    { value: 'member', label: 'Member Access' },
    { value: 'new', label: 'New Arrivals' },
    { value: 'bestseller', label: 'Best Sellers' }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-palanquin font-bold text-white">Filters</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={clearAllFilters}
            className="text-sm text-nike-coral hover:text-nike-amber transition-colors font-semibold"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-nike-coral transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Product Categories */}
        <FilterSection title="Product Categories" section="category">
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category.value} className="flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={filters.category === category.value}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all ${
                  filters.category === category.value
                    ? 'bg-nike-coral border-nike-coral'
                    : 'border-white/30 hover:border-nike-coral'
                }`}>
                  {filters.category === category.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`font-montserrat transition-colors ${
                  filters.category === category.value
                    ? 'text-nike-coral font-semibold'
                    : 'text-white/80 group-hover:text-nike-coral'
                }`}>
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" section="price">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.[0] || 0}
                onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange?.[1] || 2000])}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-nike-coral focus:outline-none"
              />
              <span className="text-white/60">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.[1] || 2000}
                onChange={(e) => updateFilter('priceRange', [filters.priceRange?.[0] || 0, parseInt(e.target.value) || 2000])}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-nike-coral focus:outline-none"
              />
            </div>
            <div className="text-sm text-white/60">
              Fr {filters.priceRange?.[0] || 0} - Fr {filters.priceRange?.[1] || 2000}
            </div>
          </div>
        </FilterSection>

        {/* Colors */}
        <FilterSection title="Colors" section="colors">
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => updateFilter('colors', color.value)}
                className={`relative w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                  filters.colors?.includes(color.value)
                    ? 'border-nike-coral shadow-lg shadow-nike-coral/30'
                    : 'border-white/30 hover:border-white/60'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {color.value === 'white' && (
                  <div className="absolute inset-1 border border-gray-300 rounded-full" />
                )}
                {filters.colors?.includes(color.value) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${
                      color.value === 'white' || color.value === 'amber' ? 'bg-black' : 'bg-white'
                    }`} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Sizes */}
        <FilterSection title="Sizes" section="sizes">
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => updateFilter('sizes', size)}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  filters.sizes?.includes(size)
                    ? 'bg-nike-coral border-nike-coral text-white'
                    : 'border-white/30 text-white/80 hover:border-nike-coral hover:text-nike-coral'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Sale & Offers */}
        <FilterSection title="Sale & Offers" section="offers">
          <div className="space-y-3">
            {offers.map((offer) => (
              <label key={offer.value} className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.offers?.includes(offer.value) || false}
                  onChange={() => updateFilter('offers', offer.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all ${
                  filters.offers?.includes(offer.value)
                    ? 'bg-nike-coral border-nike-coral'
                    : 'border-white/30 hover:border-nike-coral'
                }`}>
                  {filters.offers?.includes(offer.value) && (
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  )}
                </div>
                <span className={`font-montserrat transition-colors ${
                  filters.offers?.includes(offer.value)
                    ? 'text-nike-coral font-semibold'
                    : 'text-white/80 group-hover:text-nike-coral'
                }`}>
                  {offer.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Sport */}
        <FilterSection title="Sport" section="sport">
          <div className="space-y-3">
            {sports.map((sport) => (
              <label key={sport.value} className="flex items-center group cursor-pointer">
                <input
                  type="radio"
                  name="sport"
                  value={sport.value}
                  checked={filters.sport === sport.value}
                  onChange={(e) => updateFilter('sport', e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all ${
                  filters.sport === sport.value
                    ? 'bg-nike-coral border-nike-coral'
                    : 'border-white/30 hover:border-nike-coral'
                }`}>
                  {filters.sport === sport.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className={`font-montserrat transition-colors ${
                  filters.sport === sport.value
                    ? 'text-nike-coral font-semibold'
                    : 'text-white/80 group-hover:text-nike-coral'
                }`}>
                  {sport.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );

  // Desktop version
  if (!className.includes('mobile')) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed top-0 left-0 w-80 h-full bg-black/95 backdrop-blur-md border-r border-white/10 z-50 ${className}`}
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Mobile version
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 h-[80vh] bg-black/95 backdrop-blur-md rounded-t-2xl border-t border-white/10 z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar; 