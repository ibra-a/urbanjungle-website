import React from 'react';

const ShopHeader = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="mb-8 pt-12">
      {/* Sort Dropdown - Fixed positioning with proper margins */}
      <div className="flex justify-end mb-6">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black bg-white text-black"
        >
          <option value="position">Sort by Position</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
};

export default ShopHeader;

