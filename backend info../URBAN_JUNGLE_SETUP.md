# Urban Jungle Setup Guide

This guide explains how to set up your Urban Jungle project to use the shared `@gabfashion/ecommerce-backend` package.

## 🚀 Quick Setup

### 1. Initialize Urban Jungle Project

```bash
# Navigate to the Urban Jungle project directory
cd /Users/ibra/Projects/urbanjungle-website

# Initialize with Vite + React
npm create vite@latest . -- --template react
npm install
```

### 2. Install Backend Package

```bash
# Link to the shared backend package
npm link @gabfashion/ecommerce-backend

# Install additional dependencies
npm install @radix-ui/react-dialog @radix-ui/react-slot @supabase/supabase-js class-variance-authority clsx framer-motion lucide-react react-hot-toast react-intersection-observer react-router-dom tailwind-merge
```

### 3. Configure Environment Variables

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your actual values
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Install Dependencies

```bash
npm install
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Supabase Configuration (same instance as GAB Fashion House)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# CAC Bank API Configuration (same proxy server)
VITE_CAC_API_URL=http://157.230.110.104/api/cacint

# Payment Configuration
VITE_PAYMENT_TEST_MODE=false

# Site Configuration
VITE_SITE_NAME=Urban Jungle
VITE_SITE_URL=https://urban-jungle.vercel.app
VITE_SITE_DESCRIPTION=Urban street fashion and lifestyle

# Brand Configuration
VITE_BRAND_NAME=URBAN
VITE_BRAND_COLOR=#1a1a1a
VITE_BRAND_LOGO=/images/urban-logo.png
```

### Backend Configuration (src/config/backend.js)

The backend is configured with:
- **Table Prefix**: `urban_` (isolates Urban Jungle data)
- **Brand**: `URBAN`
- **Currency**: `DJF`
- **Payment**: CAC Bank integration

## 🗄️ Database Setup

### 1. Run Migration

Execute the Urban Jungle migration in Supabase SQL Editor:

```sql
-- Run: supabase/migrations/create_urban_jungle_tables.sql
-- This creates urban_ prefixed tables
```

### 2. Verify Tables

Check that these tables exist in your Supabase database:
- `urban_brand_products`
- `urban_orders`
- `urban_user_favorites`
- `urban_user_cart`

### 3. Add Sample Data

The migration includes sample Urban Jungle products. You can add more:

```sql
INSERT INTO urban_brand_products (item_code, product_name, brand, category, gender, price, stock_quantity, image_url, description, is_active, ready_to_sell) VALUES
('URBAN-006', 'Street Style Jacket', 'URBAN', 'Jackets', 'UNISEX', 45000, 5, 'https://example.com/jacket1.jpg', 'Urban street style jacket', true, true);
```

## 🎨 Styling Setup

### 1. Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9fafb',
          500: '#6b7280',
          900: '#1a1a1a',
        }
      }
    },
  },
  plugins: [],
}
```

### 3. Add Tailwind to CSS (src/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Urban Jungle specific styles */
.urban-gradient {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
```

## 📱 Component Structure

### 1. Create Additional Components

You'll need to create these components:

```bash
# Create component files
touch src/components/Header.jsx
touch src/components/Footer.jsx
touch src/components/LoadingSkeleton.jsx
touch src/pages/HomePage.jsx
touch src/pages/ProductDetailPage.jsx
touch src/pages/CartPage.jsx
touch src/pages/FavoritesPage.jsx
touch src/pages/CheckoutPage.jsx
touch src/pages/AuthPage.jsx
touch src/pages/ProfilePage.jsx
touch src/pages/OrdersPage.jsx
```

### 2. Key Components

- **ProductCard**: ✅ Already created - Displays individual products with cart/favorites
- **ProductsPage**: ✅ Already created - Lists all products with filtering
- **Header**: Navigation with cart/favorites counts
- **CartPage**: Shopping cart management
- **CheckoutPage**: Payment processing
- **AuthPage**: Login/register forms

## 🔐 Authentication Setup

### 1. Supabase Auth Configuration

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Add your Urban Jungle domain to Site URL
3. Configure OAuth providers (Google, Facebook, Apple)

### 2. Auth Components

```jsx
// src/components/AuthModal.jsx
import { useApp } from '@gabfashion/ecommerce-backend'

const AuthModal = () => {
  const { actions, state } = useApp()
  
  const handleLogin = async (email, password) => {
    const result = await actions.login(email, password)
    if (result.success) {
      // Close modal, redirect, etc.
    }
  }
  
  // ... rest of component
}
```

## 💳 Payment Integration

### 1. CAC Bank Setup

The payment integration is already configured to use:
- **Proxy Server**: `http://157.230.110.104/api/cacint`
- **Credentials**: Same as GAB Fashion House
- **Currency**: DJF

### 2. Payment Flow

```jsx
// src/pages/CheckoutPage.jsx
import { backend } from '../config/backend'

const handlePayment = async (orderData) => {
  // Initiate payment
  const result = await backend.payment.initiatePayment({
    amount: orderData.total,
    phoneNumber: orderData.phone,
    orderId: orderData.id,
    description: `Urban Jungle Order #${orderData.id}`
  })
  
  if (result.success) {
    // Show OTP input
    const otp = await getOTPFromUser()
    
    // Confirm payment
    const confirmResult = await backend.payment.confirmPayment({
      paymentRequestId: result.paymentRequestId,
      otp: otp,
      phoneNumber: orderData.phone
    })
  }
}
```

## 🚀 Development

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Features

- ✅ Product listing with Urban Jungle data
- ✅ Cart functionality
- ✅ Favorites system
- ✅ Authentication
- ✅ Payment processing
- ✅ Order management

## 🌐 Deployment

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 2. Configure Environment Variables

In Vercel dashboard, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CAC_API_URL`
- `VITE_PAYMENT_TEST_MODE`

### 3. Update Supabase Auth

Add your Vercel domain to Supabase Auth settings:
- Site URL: `https://urban-jungle.vercel.app`
- Redirect URLs: `https://urban-jungle.vercel.app/auth/callback`

## 🔍 Testing

### 1. Test Data Isolation

Verify that Urban Jungle data is separate from GAB Fashion House:
- Products: `urban_brand_products` vs `gab_brand_products`
- Orders: `urban_orders` vs `gab_orders`
- Favorites: `urban_user_favorites` vs `gab_user_favorites`

### 2. Test Payment Flow

1. Add products to cart
2. Proceed to checkout
3. Test payment initiation
4. Test payment confirmation
5. Verify order creation

### 3. Test Multi-Site CORS

Verify that both sites can access the proxy server:
- GAB: `https://gab-fashion-house.vercel.app`
- Urban: `https://urban-jungle.vercel.app`

## 🛠️ Troubleshooting

### Common Issues

1. **Import Errors**: Ensure npm link is set up correctly
2. **Table Not Found**: Check that Urban Jungle tables exist
3. **CORS Errors**: Verify proxy server allows your domain
4. **Payment Failures**: Check CAC Bank credentials

### Debug Commands

```bash
# Check package installation
npm list @gabfashion/ecommerce-backend

# Verify npm link
npm ls -g --depth=0

# Test Supabase connection
# Use Supabase dashboard to verify tables

# Test proxy connectivity
curl -X GET http://157.230.110.104/health
```

## 📚 Next Steps

1. **Customize Design**: Update colors, fonts, and styling for Urban Jungle brand
2. **Add Products**: Import or manually add Urban Jungle products
3. **Configure SEO**: Add meta tags, sitemap, etc.
4. **Analytics**: Add Google Analytics or similar
5. **Performance**: Optimize images and loading

## 🆘 Support

For issues:
1. Check this setup guide
2. Review the backend package README
3. Check Supabase logs
4. Verify environment variables

---

**✅ Urban Jungle Setup Complete!** Your Urban Jungle project is now ready to use the shared backend package with complete data isolation.
