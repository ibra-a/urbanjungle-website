import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
  const getActiveFilters = () => {
    const activeFilters = [];

    // Category filter
    if (filters.category && filters.category !== '') {
      activeFilters.push({
        type: 'category',
        value: filters.category,
        label: filters.category.charAt(0).toUpperCase() + filters.category.slice(1),
        display: filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
      });
    }

    // Price range filter
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000)) {
      activeFilters.push({
        type: 'priceRange',
        value: filters.priceRange,
        label: 'priceRange',
        display: `Fr ${filters.priceRange[0]} - Fr ${filters.priceRange[1]}`
      });
    }

    // Colors filter
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach(color => {
        activeFilters.push({
          type: 'colors',
          value: color,
          label: color,
          display: color.charAt(0).toUpperCase() + color.slice(1)
        });
      });
    }

    // Sizes filter
    if (filters.sizes && filters.sizes.length > 0) {
      filters.sizes.forEach(size => {
        activeFilters.push({
          type: 'sizes',
          value: size,
          label: size,
          display: `Size ${size}`
        });
      });
    }

    // Offers filter
    if (filters.offers && filters.offers.length > 0) {
      const offerLabels = {
        sale: 'On Sale',
        member: 'Member Access',
        new: 'New Arrivals',
        bestseller: 'Best Sellers'
      };
      
      filters.offers.forEach(offer => {
        activeFilters.push({
          type: 'offers',
          value: offer,
          label: offer,
          display: offerLabels[offer] || offer
        });
      });
    }

    // Sport filter
    if (filters.sport && filters.sport !== '') {
      activeFilters.push({
        type: 'sport',
        value: filters.sport,
        label: filters.sport,
        display: filters.sport.charAt(0).toUpperCase() + filters.sport.slice(1)
      });
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  const handleRemoveFilter = (filterType, value) => {
    if (filterType === 'category' || filterType === 'sport') {
      onRemoveFilter(filterType, '');
    } else if (filterType === 'priceRange') {
      onRemoveFilter(filterType, [0, 2000]);
    } else if (filterType === 'colors' || filterType === 'sizes' || filterType === 'offers') {
      const currentValues = filters[filterType] || [];
      const newValues = currentValues.filter(v => v !== value);
      onRemoveFilter(filterType, newValues);
    }
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="text-sm font-montserrat text-white/70">
        Active Filters ({activeFilters.length}):
      </span>
      
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {activeFilters.map((filter, index) => (
            <motion.div
              key={`${filter.type}-${filter.label}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white text-sm font-semibold rounded-full group"
            >
              <span>{filter.display}</span>
              <button
                onClick={() => handleRemoveFilter(filter.type, filter.value)}
                className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={`Remove ${filter.display} filter`}
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activeFilters.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClearAll}
          className="text-sm font-semibold text-white/70 hover:text-yellow-500 transition-colors underline decoration-dotted underline-offset-2"
        >
          Clear All
        </motion.button>
      )}
    </div>
  );
};

export default FilterChips; 