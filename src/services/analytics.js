import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('⚠️ Google Analytics ID not configured. Analytics disabled.');
    return;
  }

  ReactGA.initialize(measurementId, {
    gaOptions: {
      siteSpeedSampleRate: 100, // Track all page load times
    },
  });
  
  console.log('✅ Google Analytics initialized');
};

// Track page views
export const trackPageView = (path) => {
  if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
  
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track events
export const trackEvent = (category, action, label = '', value = 0) => {
  if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
  
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// E-commerce tracking
export const trackPurchase = (orderId, amount, items) => {
  if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
  
  ReactGA.event('purchase', {
    transaction_id: orderId,
    value: amount,
    currency: 'DJF',
    items: items.map(item => ({
      item_id: item.sku || item.item_code,
      item_name: item.name || item.product_name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackAddToCart = (product) => {
  if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
  
  ReactGA.event('add_to_cart', {
    currency: 'DJF',
    value: product.price,
    items: [{
      item_id: product.sku || product.item_code,
      item_name: product.product_name || product.item_name,
      price: product.price,
      quantity: 1,
    }],
  });
};

export const trackBeginCheckout = (cartItems, totalAmount) => {
  if (!import.meta.env.VITE_GA_MEASUREMENT_ID) return;
  
  ReactGA.event('begin_checkout', {
    currency: 'DJF',
    value: totalAmount,
    items: cartItems.map(item => ({
      item_id: item.sku || item.item_code,
      item_name: item.name || item.product_name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

