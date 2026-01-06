import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { products as productsApi } from '../services/supabase';
import LiveProductCard from '../components/LiveProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ShopSidebar from '../components/ShopSidebar';
import ShopHeader from '../components/ShopHeader';
import Pagination from '../components/Pagination';
import { groupProductsByName } from '../utils/productGrouping';

const ITEMS_PER_PAGE = 24;

const Kids = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);
  
  // Get search query from URL
  const searchQuery = searchParams.get('search') || '';
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('position');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    if (fetchingRef.current) {
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await productsApi.getAll();
      
      if (dbError) {
        throw new Error(dbError.message || 'Failed to load products');
      }
      
      const fetched = Array.isArray(data) ? data : [];
      
      // Filter for kids' products (KIDS, CHILDREN, YOUTH, JUNIOR, K)
      const kidsProducts = fetched.filter(product => {
        if (product.gender) {
          const gender = product.gender.toUpperCase();
          return gender === 'KIDS' || gender === 'CHILDREN' || gender === 'YOUTH' || gender === 'JUNIOR' || gender === 'K';
        }
        // If no gender, include it (fallback)
        return true;
      });
      
      setProducts(kidsProducts);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, selectedColors, sortBy, searchQuery]);

  // Generate brand-category combinations from products
  const brandCategoryMap = new Map();
  
  products.forEach(product => {
    if (product.brand && product.item_group) {
      const category = product.item_group
        .replace(' - Urban Jungle', '')
        .replace('Urban Jungle', '')
        .trim();
      
      if (category) {
        const key = `${product.brand} - ${category}`;
        if (!brandCategoryMap.has(key)) {
          brandCategoryMap.set(key, {
            brand: product.brand,
            category: category,
            count: 0
          });
        }
        brandCategoryMap.get(key).count++;
      }
    }
  });

  // Convert to array and sort
  const brands = [
    { value: null, label: 'All Brands', count: products.length, brand: null, category: null },
    ...Array.from(brandCategoryMap.values())
      .sort((a, b) => {
        if (a.brand !== b.brand) {
          return a.brand.localeCompare(b.brand);
        }
        return a.category.localeCompare(b.category);
      })
      .map(item => ({
        value: `${item.brand} - ${item.category}`,
        label: `${item.brand} - ${item.category}`,
        count: item.count,
        brand: item.brand,
        category: item.category
      }))
  ];

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.item_group?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        product.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by brand-category combination
    if (selectedBrand) {
      const brandCategory = brands.find(b => b.value === selectedBrand);
      if (brandCategory) {
        if (brandCategory.value === null) {
          // Don't filter - show all brands
        } else if (brandCategory.brand && brandCategory.category) {
          filtered = filtered.filter(product => {
            const productBrand = product.brand?.toUpperCase();
            const productCategory = product.item_group
              ?.replace(' - Urban Jungle', '')
              .replace('Urban Jungle', '')
              .trim();
            
            return productBrand === brandCategory.brand.toUpperCase() &&
                   productCategory === brandCategory.category;
          });
        }
      }
    }

    // Filter by colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.colors || !Array.isArray(product.colors)) return false;
        
        return selectedColors.some(selectedColor => {
          return product.colors.some(colorObj => {
            const colorName = colorObj.color?.toLowerCase() || '';
            return colorName.includes(selectedColor.toLowerCase()) ||
                   selectedColor.toLowerCase() === 'navy' && colorName.includes('navy') ||
                   selectedColor.toLowerCase() === 'grey' && colorName.includes('grey') ||
                   selectedColor.toLowerCase() === 'grey' && colorName.includes('gray');
          });
        });
      });
    }

    // Filter by search query (from URL)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const searchableText = [
          product.product_name || product.item_name,
          product.item_code,
          product.brand,
          product.category || product.item_group,
          product.description
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // GROUP products by base name to merge color variants (like Tommy CK)
    filtered = groupProductsByName(filtered);

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return ((a.product_name || a.item_name) || '').localeCompare((b.product_name || b.item_name) || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate categories from products
  const categories = [
    { value: null, label: 'All', count: products.length },
    ...Array.from(
      new Set(
        products
          .map(p => p.item_group || p.category)
          .filter(Boolean)
      )
    ).map(cat => ({
      value: cat,
      label: cat,
      count: products.filter(p => 
        p.item_group === cat || p.category === cat
      ).length
    }))
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 pt-8 pb-8">
        {/* Search Results Banner */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm">
              Showing results for <span className="font-bold">"{searchQuery}"</span> 
              <span className="text-gray-600 ml-2">({filteredProducts.length} products found)</span>
            </p>
          </div>
        )}

        <ShopHeader
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-black text-white p-4 rounded-full shadow-lg flex items-center gap-2"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filter</span>
        </button>

        <div className="flex gap-8">
          <ShopSidebar
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedColors={selectedColors}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
            onColorChange={setSelectedColors}
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setIsMobileFilterOpen(false)}
          />

          <div className="flex-1">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i}>
                    <LoadingSkeleton variant="card" className="h-96" />
                    <div className="mt-4 space-y-2">
                      <LoadingSkeleton variant="text" />
                      <LoadingSkeleton variant="title" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <div className="text-red-600 font-semibold mb-2">Error Loading Products</div>
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition-colors"
                  onClick={fetchProducts}
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🧒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No kids' products found</h3>
                {products.length === 0 ? (
                  <>
                    <p className="text-gray-600 mb-4">No products in database yet.</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Run the sync script to load products from ERPNext:
                    </p>
                    <code className="block bg-gray-100 p-3 rounded text-sm font-mono mb-4">
                      node sync-urban-jungle-to-supabase.js
                    </code>
                  </>
                ) : (
                  <p className="text-gray-600">Try adjusting your filters</p>
                )}
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {paginatedProducts.map((product) => (
                    <LiveProductCard 
                      key={product.item_code || product.product_name || product.item_name}
                      product={product} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kids;
