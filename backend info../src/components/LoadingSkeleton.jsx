// Loading Skeleton Component for Urban Jungle

const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-64 bg-gray-300"></div>
      
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        
        {/* Brand and category skeleton */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        
        {/* Price skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-300 rounded"></div>
          <div className="w-16 h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
