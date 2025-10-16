# @gabfashion/ecommerce-backend

A reusable backend package for multi-site e-commerce with Supabase and CAC Bank integration.

## Features

- 🔐 **Authentication**: Email/password and social login (Google, Facebook, Apple)
- 🛍️ **Products**: Full CRUD operations with search, filtering, and pagination
- 💳 **Payments**: CAC Bank mobile money integration with proxy server
- 🛒 **Cart**: Local and server-side cart management
- ❤️ **Favorites**: User wishlist functionality
- 📦 **Orders**: Complete order management system
- 🏢 **Multi-site**: Table prefix support for multiple brands/sites
- ⚡ **Real-time**: Supabase real-time subscriptions
- 🔒 **Security**: Rate limiting, CORS, and input validation

## Installation

### Local Development (npm link)

```bash
# In the backend package directory
cd packages/ecommerce-backend
npm link

# In your project directory
npm link @gabfashion/ecommerce-backend
```

### Production (npm registry)

```bash
npm install @gabfashion/ecommerce-backend
```

## Quick Start

### 1. Basic Setup

```javascript
import { createEcommerceBackend } from '@gabfashion/ecommerce-backend'

const backend = createEcommerceBackend({
  supabaseUrl: 'your-supabase-url',
  supabaseAnonKey: 'your-supabase-anon-key',
  tablePrefix: 'gab_', // Optional: for multi-site support
  cacProxyUrl: 'http://157.230.110.104/api/cacint',
  paymentTestMode: false
})
```

### 2. React Integration

```jsx
import { AppProvider } from '@gabfashion/ecommerce-backend'
import { backend } from './config/backend'

function App() {
  return (
    <AppProvider backend={backend}>
      {/* Your app components */}
    </AppProvider>
  )
}
```

### 3. Using Services

```javascript
import { useApp } from '@gabfashion/ecommerce-backend'

function ProductComponent() {
  const { state, actions, backend } = useApp()
  
  const handleAddToCart = async (product) => {
    actions.addToCart({
      id: product.id,
      name: product.product_name,
      price: product.price,
      size: 'M',
      quantity: 1,
      image: product.image_url
    })
  }
  
  const handleToggleFavorite = async (productId) => {
    const result = await actions.toggleFavorite(productId)
    if (result.requiresAuth) {
      // Show login modal
    }
  }
  
  return (
    <div>
      <button onClick={() => handleAddToCart(product)}>
        Add to Cart
      </button>
      <button onClick={() => handleToggleFavorite(product.id)}>
        {state.favorites.includes(product.id) ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
```

## Configuration

### GAB Fashion House

```javascript
import { createEcommerceBackend, GAB_CONFIG } from '@gabfashion/ecommerce-backend'

const backend = createEcommerceBackend({
  ...GAB_CONFIG,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  tablePrefix: 'gab_'
})
```

### Urban Jungle

```javascript
import { createEcommerceBackend, URBAN_CONFIG } from '@gabfashion/ecommerce-backend'

const backend = createEcommerceBackend({
  ...URBAN_CONFIG,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  tablePrefix: 'urban_'
})
```

## Services

### Authentication Service

```javascript
// Sign up
const { data, error } = await backend.auth.signUp(email, password, userData)

// Sign in
const { data, error } = await backend.auth.signIn(email, password)

// Social login
const { data, error } = await backend.auth.signInWithGoogle()

// Sign out
await backend.auth.signOut()

// Get current user
const { user, error } = await backend.auth.getCurrentUser()
```

### Products Service

```javascript
// Get all products
const { data, error } = await backend.products.getAll()

// Get products by brand
const { data, error } = await backend.products.getByBrand('NIKE')

// Search products
const { data, error } = await backend.products.search('running shoes')

// Get product by ID
const { data, error } = await backend.products.getById(productId)

// Paginated results
const { data, error, count } = await backend.products.getPage(0, 24)
```

### Payment Service

```javascript
// Initiate payment
const result = await backend.payment.initiatePayment({
  amount: 1000,
  phoneNumber: '+25312345678',
  orderId: 'order-123',
  description: 'Order payment'
})

// Confirm payment
const confirmResult = await backend.payment.confirmPayment({
  paymentRequestId: result.paymentRequestId,
  otp: '123456',
  phoneNumber: '+25312345678'
})
```

### Cart Service

```javascript
// Add to cart
backend.cart.addToCart({
  id: 'product-123',
  name: 'Nike Air Max',
  price: 15000,
  size: 'M',
  quantity: 1,
  image: 'image-url'
})

// Get cart
const cart = backend.cart.getCart()

// Update quantity
backend.cart.updateQuantity('product-123', 'M', 2)

// Remove from cart
backend.cart.removeFromCart('product-123', 'M')

// Clear cart
backend.cart.clearCart()
```

### Favorites Service

```javascript
// Add to favorites
await backend.favorites.addFavorite(userId, productId)

// Remove from favorites
await backend.favorites.removeFavorite(userId, productId)

// Check if favorited
const isFavorited = await backend.favorites.isFavorite(userId, productId)

// Get user favorites
const favorites = await backend.favorites.getFavorites(userId)

// Get favorites with product details
const favoritesWithDetails = await backend.favorites.getFavoritesWithDetails(userId)
```

### Orders Service

```javascript
// Create order
const { success, order } = await backend.orders.createOrder({
  userId: 'user-123',
  items: cartItems,
  totalAmount: 15000,
  shippingAddress: address,
  phoneNumber: '+25312345678',
  customerEmail: 'user@example.com',
  customerName: 'John Doe'
})

// Get user orders
const { success, orders } = await backend.orders.getUserOrders(userId)

// Update payment status
await backend.orders.updateOrderPayment(orderId, {
  transactionId: 'txn-123',
  status: 'completed',
  paymentStatus: 'paid',
  paymentRequestId: 'req-123'
})
```

## Database Schema

### Required Tables

The package expects the following tables in your Supabase database:

#### Products Table
```sql
CREATE TABLE brand_products (
  id SERIAL PRIMARY KEY,
  item_code VARCHAR UNIQUE NOT NULL,
  product_name VARCHAR NOT NULL,
  brand VARCHAR NOT NULL,
  category VARCHAR,
  gender VARCHAR,
  price DECIMAL,
  stock_quantity INTEGER DEFAULT 0,
  image_url VARCHAR,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  ready_to_sell BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total_amount DECIMAL NOT NULL,
  currency VARCHAR DEFAULT 'DJF',
  shipping_address JSONB,
  customer_email VARCHAR,
  customer_name VARCHAR,
  customer_phone VARCHAR,
  status VARCHAR DEFAULT 'pending',
  payment_status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR,
  transaction_id VARCHAR,
  cac_payment_request_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);
```

#### Favorites Table
```sql
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

#### Cart Table (Optional)
```sql
CREATE TABLE user_cart (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  items JSONB DEFAULT '[]',
  total DECIMAL DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Multi-site Setup

For multiple sites, create tables with prefixes:

```sql
-- GAB Fashion House tables
CREATE TABLE gab_brand_products (LIKE brand_products INCLUDING ALL);
CREATE TABLE gab_orders (LIKE orders INCLUDING ALL);
CREATE TABLE gab_user_favorites (LIKE user_favorites INCLUDING ALL);

-- Urban Jungle tables
CREATE TABLE urban_brand_products (LIKE brand_products INCLUDING ALL);
CREATE TABLE urban_orders (LIKE orders INCLUDING ALL);
CREATE TABLE urban_user_favorites (LIKE user_favorites INCLUDING ALL);
```

## Proxy Server

The package includes a proxy server for CAC Bank API integration.

### Setup

```bash
cd packages/ecommerce-backend/proxy
npm install
npm start
```

### Environment Variables

```bash
PORT=3001
NODE_ENV=production
CAC_API_BASE_URL=http://172.17.2.52:8080/pay/paymentapi
```

### PM2 Deployment

```bash
npm run pm2
```

## API Endpoints

The proxy server provides the following endpoints:

- `POST /auth/signin` - CAC Bank authentication
- `POST /PaymentInitiateRequest` - Initiate payment
- `POST /PaymentConfirmationRequest` - Confirm payment with OTP
- `POST /verify-payment` - Verify payment status
- `GET /health` - Health check

## Error Handling

All services return consistent error objects:

```javascript
{
  success: false,
  error: 'Error message',
  data: null
}
```

## TypeScript Support

The package is written in JavaScript but can be used with TypeScript. Type definitions can be added in future versions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on the GitHub repository.

## Changelog

### v1.0.0
- Initial release
- Complete ecommerce backend functionality
- Multi-site support
- CAC Bank integration
- React context integration

