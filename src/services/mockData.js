// Mock product data with enhanced structure for filtering
export const mockProducts = [
  // FOOTWEAR PRODUCTS
  {
    id: 1,
    itemName: "Air Jordan 1 Retro High OG",
    itemGroup: "Footwear Sneakers",
    category: "footwear",
    subcategory: "basketball",
    collection: "air-jordan",
    balanceValue: "Fr 950.00",
    price: 950.00,
    salePrice: null,
    stockQuantity: 1500,
    colors: ["black", "white", "red"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    sport: "basketball",
    gender: "men",
    isOnSale: false,
    isMemberAccess: true,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Classic basketball shoe with premium leather construction"
  },
  {
    id: 2,
    itemName: "Nike Air Max 90",
    itemGroup: "Footwear Lifestyle",
    category: "footwear",
    subcategory: "lifestyle",
    collection: "air-max",
    balanceValue: "Fr 725.00",
    price: 725.00,
    salePrice: 429.00,
    stockQuantity: 2000,
    colors: ["white", "blue", "gray"],
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    sport: "lifestyle",
    gender: "men",
    isOnSale: true,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Iconic running-inspired lifestyle shoe"
  },
  {
    id: 3,
    itemName: "Nike Pegasus 41",
    itemGroup: "Footwear Running",
    category: "footwear",
    subcategory: "running",
    collection: "pegasus",
    balanceValue: "Fr 875.00",
    price: 875.00,
    salePrice: null,
    stockQuantity: 1800,
    colors: ["black", "coral", "blue"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    sport: "running",
    gender: "men",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: true,
    isBestSeller: false,
    image: "/api/placeholder/300/300",
    description: "Daily running shoe with responsive cushioning"
  },
  {
    id: 4,
    itemName: "Nike Mercurial Superfly",
    itemGroup: "Footwear Football",
    category: "footwear",
    subcategory: "football",
    collection: "mercurial",
    balanceValue: "Fr 1,400.00",
    price: 1400.00,
    salePrice: null,
    stockQuantity: 800,
    colors: ["green", "black", "amber"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    sport: "football",
    gender: "men",
    isOnSale: false,
    isMemberAccess: true,
    isNewArrival: true,
    isBestSeller: false,
    image: "/api/placeholder/300/300",
    description: "Elite football boot for speed and agility"
  },

  // APPAREALS PRODUCTS
  {
    id: 5,
    itemName: "Mens Nike Training T-Shirt",
    itemGroup: "Apparel T-Shirts",
    category: "appareals",
    subcategory: "t-shirts",
    collection: "dri-fit",
    balanceValue: "Fr 125.00",
    price: 125.00,
    salePrice: null,
    stockQuantity: 5000,
    colors: ["black", "white", "coral"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sport: "training",
    gender: "men",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Moisture-wicking training shirt"
  },
  {
    id: 6,
    itemName: "Jordan Jumpman Hoodie",
    itemGroup: "Apparel Hoodies",
    category: "appareals",
    subcategory: "hoodies",
    collection: "jordan",
    balanceValue: "Fr 450.00",
    price: 450.00,
    salePrice: 299.00,
    stockQuantity: 1200,
    colors: ["black", "gray", "red"],
    sizes: ["S", "M", "L", "XL"],
    sport: "lifestyle",
    gender: "men",
    isOnSale: true,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Classic Jordan hoodie with iconic Jumpman logo"
  },
  {
    id: 7,
    itemName: "Nike Dri-FIT Shorts",
    itemGroup: "Apparel Shorts",
    category: "appareals",
    subcategory: "shorts",
    collection: "dri-fit",
    balanceValue: "Fr 185.00",
    price: 185.00,
    salePrice: null,
    stockQuantity: 3500,
    colors: ["black", "blue", "gray"],
    sizes: ["S", "M", "L", "XL"],
    sport: "training",
    gender: "men",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: true,
    isBestSeller: false,
    image: "/api/placeholder/300/300",
    description: "Performance shorts for training and workouts"
  },
  {
    id: 8,
    itemName: "Nike Tracksuit Set",
    itemGroup: "Apparel Tracksuits",
    category: "appareals",
    subcategory: "tracksuits",
    collection: "sportswear",
    balanceValue: "Fr 650.00",
    price: 650.00,
    salePrice: null,
    stockQuantity: 800,
    colors: ["black", "gray", "blue"],
    sizes: ["M", "L", "XL"],
    sport: "lifestyle",
    gender: "men",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Complete tracksuit for casual wear"
  },

  // ACCESSORIES PRODUCTS
  {
    id: 9,
    itemName: "Air Jordan Mini Backpack",
    itemGroup: "Accessories Bags",
    category: "accessories",
    subcategory: "backpacks",
    collection: "jordan",
    balanceValue: "Fr 320.00",
    price: 320.00,
    salePrice: null,
    stockQuantity: 1000,
    colors: ["black", "red"],
    sizes: ["one-size"],
    sport: "lifestyle",
    gender: "unisex",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Compact backpack with Jordan branding"
  },
  {
    id: 10,
    itemName: "Nike Swoosh Cap",
    itemGroup: "Accessories Headwear",
    category: "accessories",
    subcategory: "caps",
    collection: "sportswear",
    balanceValue: "Fr 95.00",
    price: 95.00,
    salePrice: 65.00,
    stockQuantity: 2500,
    colors: ["black", "white", "blue", "coral"],
    sizes: ["one-size"],
    sport: "lifestyle",
    gender: "unisex",
    isOnSale: true,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Classic Nike cap with embroidered Swoosh"
  },
  {
    id: 11,
    itemName: "Nike Elite Socks",
    itemGroup: "Accessories Socks",
    category: "accessories",
    subcategory: "socks",
    collection: "elite",
    balanceValue: "Fr 45.00",
    price: 45.00,
    salePrice: null,
    stockQuantity: 8000,
    colors: ["white", "black", "blue"],
    sizes: ["S", "M", "L"],
    sport: "basketball",
    gender: "unisex",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: true,
    isBestSeller: false,
    image: "/api/placeholder/300/300",
    description: "Performance basketball socks"
  },
  {
    id: 12,
    itemName: "Nike Gym Bag",
    itemGroup: "Accessories Bags",
    category: "accessories",
    subcategory: "bags",
    collection: "training",
    balanceValue: "Fr 285.00",
    price: 285.00,
    salePrice: null,
    stockQuantity: 600,
    colors: ["black", "gray"],
    sizes: ["one-size"],
    sport: "training",
    gender: "unisex",
    isOnSale: false,
    isMemberAccess: true,
    isNewArrival: false,
    isBestSeller: false,
    image: "/api/placeholder/300/300",
    description: "Spacious gym bag for training gear"
  },

  // WOMEN'S PRODUCTS
  {
    id: 13,
    itemName: "Women's Air Max 270",
    itemGroup: "Footwear Lifestyle",
    category: "footwear",
    subcategory: "lifestyle",
    collection: "air-max",
    balanceValue: "Fr 795.00",
    price: 795.00,
    salePrice: null,
    stockQuantity: 1500,
    colors: ["white", "coral", "blue"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    sport: "lifestyle",
    gender: "women",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: true,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "Women's lifestyle shoe with large Air unit"
  },
  {
    id: 14,
    itemName: "Women's Yoga Leggings",
    itemGroup: "Apparel Leggings",
    category: "appareals",
    subcategory: "leggings",
    collection: "yoga",
    balanceValue: "Fr 225.00",
    price: 225.00,
    salePrice: null,
    stockQuantity: 2800,
    colors: ["black", "gray", "coral"],
    sizes: ["XS", "S", "M", "L", "XL"],
    sport: "training",
    gender: "women",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: false,
    isBestSeller: true,
    image: "/api/placeholder/300/300",
    description: "High-waisted yoga leggings"
  },

  // KIDS PRODUCTS
  {
    id: 15,
    itemName: "Kids Air Jordan 1 Low",
    itemGroup: "Footwear Kids",
    category: "footwear",
    subcategory: "basketball",
    collection: "air-jordan",
    balanceValue: "Fr 385.00",
    price: 385.00,
    salePrice: null,
    stockQuantity: 1200,
    colors: ["white", "black", "red"],
    sizes: ["10", "11", "12", "13", "1", "2", "3"],
    sport: "basketball",
    gender: "kids",
    isOnSale: false,
    isMemberAccess: false,
    isNewArrival: true,
    isBestSeller: false,
    image: "/api/placeholder/300/300",
    description: "Kids version of the classic Air Jordan 1"
  }
];

// Enhanced filtering functions
export const filterProducts = (products, filters) => {
  let filtered = [...products];

  // Category filter
  if (filters.category && filters.category !== '') {
    filtered = filtered.filter(product => product.category === filters.category);
  }

  // Price range filter
  if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000)) {
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
  }

  // Colors filter
  if (filters.colors && filters.colors.length > 0) {
    filtered = filtered.filter(product =>
      filters.colors.some(color => product.colors.includes(color))
    );
  }

  // Sizes filter
  if (filters.sizes && filters.sizes.length > 0) {
    filtered = filtered.filter(product =>
      filters.sizes.some(size => product.sizes.includes(size))
    );
  }

  // Sport filter
  if (filters.sport && filters.sport !== '') {
    filtered = filtered.filter(product => product.sport === filters.sport);
  }

  // Offers filter
  if (filters.offers && filters.offers.length > 0) {
    filtered = filtered.filter(product => {
      return filters.offers.some(offer => {
        switch (offer) {
          case 'sale':
            return product.isOnSale;
          case 'member':
            return product.isMemberAccess;
          case 'new':
            return product.isNewArrival;
          case 'bestseller':
            return product.isBestSeller;
          default:
            return false;
        }
      });
    });
  }

  return filtered;
};

// Sort products
export const sortProducts = (products, sortBy) => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    case 'bestseller':
      return sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        // Featured logic: New arrivals first, then bestsellers, then member access
        const aScore = (a.isNewArrival ? 4 : 0) + (a.isBestSeller ? 2 : 0) + (a.isMemberAccess ? 1 : 0);
        const bScore = (b.isNewArrival ? 4 : 0) + (b.isBestSeller ? 2 : 0) + (b.isMemberAccess ? 1 : 0);
        return bScore - aScore;
      });
  }
};

// Get filter counts for better UX
export const getFilterCounts = (products, currentFilters) => {
  const counts = {
    categories: {},
    colors: {},
    sizes: {},
    sports: {},
    offers: {}
  };

  products.forEach(product => {
    // Category counts
    counts.categories[product.category] = (counts.categories[product.category] || 0) + 1;

    // Color counts
    product.colors.forEach(color => {
      counts.colors[color] = (counts.colors[color] || 0) + 1;
    });

    // Size counts
    product.sizes.forEach(size => {
      counts.sizes[size] = (counts.sizes[size] || 0) + 1;
    });

    // Sport counts
    counts.sports[product.sport] = (counts.sports[product.sport] || 0) + 1;

    // Offer counts
    if (product.isOnSale) counts.offers.sale = (counts.offers.sale || 0) + 1;
    if (product.isMemberAccess) counts.offers.member = (counts.offers.member || 0) + 1;
    if (product.isNewArrival) counts.offers.new = (counts.offers.new || 0) + 1;
    if (product.isBestSeller) counts.offers.bestseller = (counts.offers.bestseller || 0) + 1;
  });

  return counts;
}; 