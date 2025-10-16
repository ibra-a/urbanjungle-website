import { motion } from "framer-motion";

const LoadingSkeleton = ({ className = "", variant = "default" }) => {
  const getSkeletonClasses = () => {
    const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded";
    
    switch (variant) {
      case "card":
        return `${baseClasses} h-64 w-full`;
      case "text":
        return `${baseClasses} h-4 w-3/4`;
      case "title":
        return `${baseClasses} h-8 w-1/2`;
      case "circle":
        return `${baseClasses} h-12 w-12 rounded-full`;
      case "button":
        return `${baseClasses} h-12 w-32 rounded-full`;
      default:
        return `${baseClasses} h-4 w-full`;
    }
  };

  return (
    <motion.div
      className={`${getSkeletonClasses()} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
    </motion.div>
  );
};

const ProductCardSkeleton = () => {
  return (
    <div className="space-y-4">
      <LoadingSkeleton variant="card" />
      <div className="space-y-2">
        <LoadingSkeleton variant="text" />
        <LoadingSkeleton variant="title" />
        <LoadingSkeleton variant="text" className="w-1/4" />
      </div>
    </div>
  );
};

const HeroSkeleton = () => {
  return (
    <div className="flex xl:flex-row flex-col gap-10 min-h-screen">
      <div className="xl:w-2/5 space-y-6">
        <LoadingSkeleton variant="text" className="w-1/3" />
        <LoadingSkeleton variant="title" className="w-full h-16" />
        <LoadingSkeleton variant="text" className="w-2/3" />
        <LoadingSkeleton variant="button" />
        <div className="flex gap-8 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <LoadingSkeleton variant="title" className="w-16 h-8" />
              <LoadingSkeleton variant="text" className="w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <LoadingSkeleton variant="card" className="h-96" />
      </div>
    </div>
  );
};

export { LoadingSkeleton, ProductCardSkeleton, HeroSkeleton };
export default LoadingSkeleton; 