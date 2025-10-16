// Urban Jungle Products Page

import { useState, useEffect } from 'react'
import { backend } from '../config/backend'
import ProductCard from '../components/ProductCard'
import LoadingSkeleton from '../components/LoadingSkeleton'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    search: ''
  })

  // Load products
  const loadProducts = async (pageNum = 0, reset = false) => {
    try {
      setLoading(true)
      
      let result
      if (filters.search) {
        result = await backend.products.search(filters.search)
      } else if (filters.category && filters.gender) {
        result = await backend.products.getBrandByCategoryAndGender(
          'URBAN',
          filters.category,
          filters.gender,
          pageNum,
          24
        )
      } else if (filters.category) {
        result = await backend.products.getBrandByCategory(
          'URBAN',
          filters.category,
          pageNum,
          24
        )
      } else if (filters.gender) {
        result = await backend.products.getByGender(
          filters.gender,
          pageNum,
          24
        )
      } else {
        result = await backend.products.getBySpecificBrand(
          'URBAN',
          pageNum,
          24
        )
      }

      if (result.error) {
        setError(result.error.message)
        return
      }

      const newProducts = result.data || []
      
      if (reset) {
        setProducts(newProducts)
      } else {
        setProducts(prev => [...prev, ...newProducts])
      }

      // Check if there are more products
      if (result.count) {
        setHasMore((pageNum + 1) * 24 < result.count)
      } else {
        setHasMore(newProducts.length === 24)
      }

    } catch (err) {
      setError('Failed to load products')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load products on mount and when filters change
  useEffect(() => {
    setPage(0)
    loadProducts(0, true)
  }, [filters])

  // Load more products
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadProducts(nextPage, false)
  }

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      search: ''
    })
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadProducts(0, true)}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Urban Collection</h1>
        <p className="text-gray-600">Discover the latest in urban street fashion</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Categories</option>
              <option value="Hoodies">Hoodies</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Pants">Pants</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Genders</option>
              <option value="MALE">Men</option>
              <option value="FEMALE">Women</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {/* No Products Message */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductsPage
