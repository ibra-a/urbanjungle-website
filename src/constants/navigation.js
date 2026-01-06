export const navigationData = {
  men: {
    label: "Men",
    categories: {
      footwear: {
        label: "Footwear",
        items: [
          { name: "Sneakers", href: "/men/footwear/sneakers" },
          { name: "Dress Shoes", href: "/men/footwear/dress-shoes" },
          { name: "Boots", href: "/men/footwear/boots" },
          { name: "Sandals", href: "/men/footwear/sandals" },
          { name: "Sports Shoes", href: "/men/footwear/sports" },
          { name: "Casual Shoes", href: "/men/footwear/casual" }
        ]
      },
      apparel: {
        label: "Apparel",
        items: [
          { name: "T-Shirts", href: "/men/apparel/t-shirts" },
          { name: "Shirts", href: "/men/apparel/shirts" },
          { name: "Hoodies", href: "/men/apparel/hoodies" },
          { name: "Jackets", href: "/men/apparel/jackets" },
          { name: "Pants", href: "/men/apparel/pants" },
          { name: "Shorts", href: "/men/apparel/shorts" },
          { name: "Activewear", href: "/men/apparel/activewear" }
        ]
      },
      accessories: {
        label: "Accessories",
        items: [
          { name: "Bags", href: "/men/accessories/bags" },
          { name: "Watches", href: "/men/accessories/watches" },
          { name: "Belts", href: "/men/accessories/belts" },
          { name: "Wallets", href: "/men/accessories/wallets" },
          { name: "Caps", href: "/men/accessories/caps" },
          { name: "Sunglasses", href: "/men/accessories/sunglasses" }
        ]
      }
    }
  },
  women: {
    label: "Women",
    categories: {
      footwear: {
        label: "Footwear",
        items: [
          { name: "Heels", href: "/women/footwear/heels" },
          { name: "Flats", href: "/women/footwear/flats" },
          { name: "Sneakers", href: "/women/footwear/sneakers" },
          { name: "Boots", href: "/women/footwear/boots" },
          { name: "Sandals", href: "/women/footwear/sandals" },
          { name: "Sports Shoes", href: "/women/footwear/sports" }
        ]
      },
      apparel: {
        label: "Apparel",
        items: [
          { name: "Dresses", href: "/women/apparel/dresses" },
          { name: "Tops", href: "/women/apparel/tops" },
          { name: "Jeans", href: "/women/apparel/jeans" },
          { name: "Skirts", href: "/women/apparel/skirts" },
          { name: "Jackets", href: "/women/apparel/jackets" },
          { name: "Activewear", href: "/women/apparel/activewear" },
          { name: "Lingerie", href: "/women/apparel/lingerie" }
        ]
      },
      accessories: {
        label: "Accessories",
        items: [
          { name: "Handbags", href: "/women/accessories/handbags" },
          { name: "Jewelry", href: "/women/accessories/jewelry" },
          { name: "Scarves", href: "/women/accessories/scarves" },
          { name: "Sunglasses", href: "/women/accessories/sunglasses" },
          { name: "Watches", href: "/women/accessories/watches" },
          { name: "Hair Accessories", href: "/women/accessories/hair" }
        ]
      }
    }
  },
  kids: {
    label: "Kids",
    categories: {
      footwear: {
        label: "Footwear",
        items: [
          { name: "School Shoes", href: "/kids/footwear/school" },
          { name: "Sneakers", href: "/kids/footwear/sneakers" },
          { name: "Sandals", href: "/kids/footwear/sandals" },
          { name: "Boots", href: "/kids/footwear/boots" },
          { name: "Sports Shoes", href: "/kids/footwear/sports" },
          { name: "First Steps", href: "/kids/footwear/first-steps" }
        ]
      },
      apparel: {
        label: "Apparel",
        items: [
          { name: "T-Shirts", href: "/kids/apparel/t-shirts" },
          { name: "Dresses", href: "/kids/apparel/dresses" },
          { name: "Pants", href: "/kids/apparel/pants" },
          { name: "Jackets", href: "/kids/apparel/jackets" },
          { name: "School Uniforms", href: "/kids/apparel/uniforms" },
          { name: "Sleepwear", href: "/kids/apparel/sleepwear" }
        ]
      },
      accessories: {
        label: "Accessories",
        items: [
          { name: "Backpacks", href: "/kids/accessories/backpacks" },
          { name: "Lunch Boxes", href: "/kids/accessories/lunch-boxes" },
          { name: "Caps", href: "/kids/accessories/caps" },
          { name: "Watches", href: "/kids/accessories/watches" },
          { name: "Hair Accessories", href: "/kids/accessories/hair" },
          { name: "Toys", href: "/kids/accessories/toys" }
        ]
      }
    }
  },
  brands: {
    label: "Brands",
    categories: {
      sportswear: {
        label: "Sportswear",
        items: [
          { name: "Nike", href: "/shop?brand=nike", featured: true },
          { name: "Puma", href: "/shop?brand=puma" }
        ]
      },
      lifestyle: {
        label: "Lifestyle",
        items: [
          { name: "Jordan", href: "/shop?brand=jordan", featured: true },
          { name: "Converse", href: "/shop?brand=converse", featured: true },
          { name: "Vans", href: "/shop?brand=vans" },
          { name: "Crocs", href: "/shop?brand=crocs" }
        ]
      },
      luxury: {
        label: "Luxury",
        items: [
          { name: "Gucci", href: "/brands/gucci" },
          { name: "Louis Vuitton", href: "/brands/louis-vuitton" },
          { name: "Balenciaga", href: "/brands/balenciaga" },
          { name: "Off-White", href: "/brands/off-white" },
          { name: "Golden Goose", href: "/brands/golden-goose" },
          { name: "Stone Island", href: "/brands/stone-island" }
        ]
      }
    }
  }
};

export const mainNavItems = [
  { name: "Home", href: "/", icon: "Home" },
  { name: "Shop", href: "/shop", icon: "ShoppingBag" },
  { name: "Men", href: "/men", hasDropdown: true },
  { name: "Women", href: "/women", hasDropdown: true },
  { name: "Kids", href: "/kids", hasDropdown: true },
  { name: "Brands", href: "/brands", hasDropdown: true },
  { name: "Sale", href: "/sale", icon: "Percent", highlight: true },
  { name: "New Arrivals", href: "/new-arrivals", icon: "Sparkles" }
];

export const quickLinks = [
  { name: "Track Order", href: "/track-order" },
  { name: "Size Guide", href: "/size-guide" },
  { name: "Customer Service", href: "/support" },
  { name: "Returns", href: "/returns" }
]; 