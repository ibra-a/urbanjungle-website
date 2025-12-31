import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { navigationData } from '../constants/navigation';

const Brands = () => {
  const brandsData = navigationData.brands;

  const featuredBrands = [
    {
      name: 'Nike',
      description: 'Just Do It - The world\'s leading athletic brand',
      image: '/api/placeholder/300/200',
      href: '/brands/nike'
    },
    {
      name: 'Jordan',
      description: 'Jumpman - Iconic basketball and lifestyle brand',
      image: '/api/placeholder/300/200',
      href: '/brands/jordan'
    },
    {
      name: 'Converse',
      description: 'All Star - Classic American footwear since 1908',
      image: '/api/placeholder/300/200',
      href: '/brands/converse'
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <motion.section 
        className="bg-white py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Our <span className="text-yellow-500">Brands</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the world's most iconic brands, from athletic powerhouses to luxury lifestyle labels.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Featured Brands */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              Featured Brands
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {featuredBrands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-black/40 flex items-center justify-center">
                      <h3 className="text-3xl font-bold text-white">{brand.name}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{brand.description}</p>
                    <Link
                      to={brand.href}
                      className="inline-flex items-center gap-2 text-yellow-500 font-semibold hover:gap-3 transition-all group"
                    >
                      Shop {brand.name}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Shop by Category
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {Object.entries(brandsData.categories).map(([categoryKey, category], index) => (
                <motion.div
                  key={categoryKey}
                  className="bg-white p-8 rounded-2xl shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
                    {category.label}
                  </h3>
                  
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        to={item.href}
                        className="flex items-center justify-between group py-2 hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors"
                      >
                        <span className="font-medium text-gray-700 group-hover:text-yellow-500 transition-colors">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {item.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Can't Find Your Favorite Brand?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We're constantly adding new brands to our collection. Let us know what you're looking for.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500/90 transition-colors"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Brands; 