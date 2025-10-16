// Urban Jungle Product Card Component

import { useState } from 'react'
import { useApp } from '@gabfashion/ecommerce-backend'
import { backend } from '../config/backend'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const { state, actions } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = () => {
    actions.addToCart({
      id: product.id,
      name: product.product_name,
      price: product.price,
      size: 'M', // Default size, you can make this selectable
      quantity: 1,
      image: product.image_url
    })
    
    toast.success('Added to cart!')
  }

  const handleToggleFavorite = async () => {
    if (!state.user) {
      toast.error('Please log in to save favorites')
      return
    }

    setIsLoading(true)
    try {
      const result = await actions.toggleFavorite(product.item_code)
      if (result.success) {
        toast.success(result.action === 'added' ? 'Added to favorites!' : 'Removed from favorites!')
      }
    } catch (error) {
      toast.error('Failed to update favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const isFavorited = state.favorites.includes(product.item_code)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image_url || '/images/placeholder.jpg'}
          alt={product.product_name}
          className="w-full h-64 object-cover"
        />
        
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          {isFavorited ? (
            <span className="text-red-500 text-xl">❤️</span>
          ) : (
            <span className="text-gray-400 text-xl">🤍</span>
          )}
        </button>
        
        {/* Stock indicator */}
        {product.stock_quantity > 0 ? (
          <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            In Stock
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
            Out of Stock
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.product_name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-2">
          {product.brand} • {product.category}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {product.price?.toLocaleString()} DJF
          </span>
          
          {product.stock_quantity > 0 && (
            <span className="text-sm text-gray-500">
              {product.stock_quantity} left
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add to Cart
          </button>
          
          <button
            onClick={() => window.location.href = `/products/${product.id}`}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
