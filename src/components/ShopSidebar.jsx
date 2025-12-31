import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopSidebar = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  onCategoryChange,
  onBrandChange,
  selectedColors,
  onColorChange,
  isMobileOpen = false,
  onMobileClose = () => {},
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(true);
  const [isBrandOpen, setIsBrandOpen] = React.useState(true);
  const [isColorOpen, setIsColorOpen] = React.useState(true);

  // Real colors from your inventory
  const colors = [
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'White', value: 'white', hex: '#FFFFFF' },
    { name: 'Blue', value: 'blue', hex: '#0047AB' },
    { name: 'Navy', value: 'navy', hex: '#002868' },
    { name: 'Red', value: 'red', hex: '#CE1126' },
    { name: 'Grey', value: 'grey', hex: '#808080' },
    { name: 'Green', value: 'green', hex: '#228B22' },
    { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { name: 'Brown', value: 'brown', hex: '#8B4513' },
    { name: 'Yellow', value: 'yellow', hex: '#FFD700' },
  ];

  const toggleColor = (colorValue) => {
    if (selectedColors.includes(colorValue)) {
      onColorChange(selectedColors.filter((c) => c !== colorValue));
    } else {
      onColorChange([...selectedColors, colorValue]);
    }
  };

  const FilterContent = () => (
    <>
      {/* Category Filter */}
      <div className="mb-8">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center justify-between py-3 border-b border-gray-200"
        >
          <span className="text-sm font-bold uppercase tracking-wide text-black">Category</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isCategoryOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isCategoryOpen && (
          <div className="py-4 space-y-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value)}
                className={`w-full text-left px-2 py-2 text-sm transition-colors ${
                  selectedCategory === category.value
                    ? 'text-black font-medium'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {category.label}
                {category.count && (
                  <span className="ml-2 text-gray-400">({category.count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="mb-8">
        <button
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="w-full flex items-center justify-between py-3 border-b border-gray-200"
        >
          <span className="text-sm font-bold uppercase tracking-wide text-black">Brand</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isBrandOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isBrandOpen && (
          <div className="py-4 space-y-2">
            {brands && brands.map((brand) => (
              <button
                key={brand.value}
                onClick={() => onBrandChange(brand.value)}
                className={`w-full text-left px-2 py-2 text-sm transition-colors ${
                  selectedBrand === brand.value
                    ? 'text-black font-medium'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {brand.label}
                {brand.count && (
                  <span className="ml-2 text-gray-400">({brand.count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Filter */}
      <div className="mb-8">
        <button
          onClick={() => setIsColorOpen(!isColorOpen)}
          className="w-full flex items-center justify-between py-3 border-b border-gray-200"
        >
          <span className="text-sm font-bold uppercase tracking-wide text-black">Colour</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isColorOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isColorOpen && (
          <div className="py-4">
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => toggleColor(color.value)}
                  className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColors.includes(color.value)
                      ? 'border-black scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColors.includes(color.value) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke={color.value === 'white' ? 'black' : 'white'}
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedColors.length > 0 && (
              <button
                onClick={() => onColorChange([])}
                className="mt-4 text-sm text-gray-600 hover:text-black underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <FilterContent />
      </aside>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-xl font-bold uppercase tracking-wide">Filters</h2>
                  <button
                    onClick={onMobileClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Filter Content */}
                <FilterContent />

                {/* Apply Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                  <button
                    onClick={onMobileClose}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShopSidebar;

