# 🔍 Urban Jungle vs Tommy-CK Architecture Comparison

**Date:** January 2025  
**Purpose:** Align Urban Jungle with Tommy-CK architecture for proper authentication, orders, and checkout

---

## 📊 Current State Analysis

### **1. Backend Architecture**

#### **Tommy-CK (Reference)**
```javascript
// Uses @gabfashion/ecommerce-backend package
import { AppProvider } from '@gabfashion/ecommerce-backend'
import { createEcommerceBackend, URBAN_CONFIG } from '@gabfashion/ecommerce-backend'

const backend = createEcommerceBackend({
  ...URBAN_CONFIG,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  tablePrefix: 'urban_',
})

// App.jsx
<AppProvider backend={backend}>
  {/* App */}
</AppProvider>
```

**Services Available:**
- `backend.auth` - Authentication service
- `backend.orders` - Orders service (OrdersService class)
- `backend.payment` - Payment service (PaymentService class)
- `backend.products` - Products service
- `backend.favorites` - Favorites service
- `backend.cart` - Cart service
- `backend.supabase` - Supabase client

#### **Urban Jungle (Current)**
```javascript
// Custom backend configuration
import { backend } from './config/backend'

// Custom AppContext (not from package)
import { AppProvider } from './context/AppContext'

// App.jsx
<AppProvider>
  {/* App */}
</AppProvider>
```

**Services Available:**
- `backend.auth` - Custom auth methods (direct Supabase calls)
- `backend.orders` - Custom ordersService (basic implementation)
- `backend.payment` - Payment config only (no service)
- `backend.products` - Custom apiService
- `backend.favorites` - Custom favoritesService
- `backend.supabase` - Supabase client

**❌ Issues:**
- Not using the standardized backend package
- Custom implementations that may not match expected patterns
- No unified service layer

---

### **2. Authentication**

#### **Tommy-CK**
```javascript
// Uses backend.auth from package
const { backend } = useApp()

// Login
await backend.auth.signIn(email, password)

// Register
await backend.auth.signUp(email, password, userData)

// Social login
await backend.auth.signInWithGoogle()
```

#### **Urban Jungle**
```javascript
// Uses custom backend.auth
const { backend } = useApp()

// Login
await backend.auth.signIn(email, password) // ✅ Similar

// Register
await backend.auth.signUp(email, password, userData) // ✅ Similar
```

**✅ Status:** Authentication is similar, but Urban Jungle uses custom implementation instead of package

---

### **3. Orders Creation**

#### **Tommy-CK (Correct Pattern)**
```javascript
// Uses backend.orders.createOrder() service
const { backend } = useApp()

const result = await backend.orders.createOrder({
  userId: user?.id,
  items: cart.items.map(item => ({
    item_code: item.itemCode,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    size: item.size,
    color: item.color,
    image: item.image
  })),
  totalAmount: total,
  shippingAddress: shippingData,
  phoneNumber: paymentData.phoneNumber,
  customerEmail: shippingData.email,
  customerName: `${shippingData.firstName} ${shippingData.lastName}`,
  currency: 'DJF',
  paymentMethod: 'CAC Bank Mobile Money'
})

if (result.success) {
  const orderId = result.order.id
  // Proceed with payment
}
```

**Features:**
- ✅ Uses service layer (`backend.orders.createOrder()`)
- ✅ Consistent error handling
- ✅ Returns `{ success, order, error }` format
- ✅ Handles both `user_id` and `customer_id` fields
- ✅ Proper table prefix support (`urban_orders`)

#### **Urban Jungle (Current - Direct Supabase)**
```javascript
// CheckoutCOD.jsx - Direct Supabase call
const { data: order, error } = await supabase
  .from('urban_orders')
  .insert({
    user_id: user?.id,
    customer_name: `${shippingData.firstName} ${shippingData.lastName}`,
    customer_email: shippingData.email,
    customer_phone: shippingData.phone,
    shipping_address: shippingData,
    items: cart.items.map(item => ({...})),
    total_amount: total,
    payment_method: 'Cash on Delivery',
    payment_status: 'pending',
    status: 'confirmed',
    delivery_status: 'pending',
    synced_to_erp: false,
    store_name: 'Urban Jungle'
  })
  .select()
  .single()
```

**Issues:**
- ❌ Direct Supabase calls instead of service layer
- ❌ Inconsistent field names (`user_id` vs `customer_id`)
- ❌ No standardized error handling
- ❌ Different structure in different checkout pages

#### **Urban Jungle (CheckoutWithCAC)**
```javascript
// Uses cacBankService.createOrder() - Custom function
const orderResult = await cacBankService.createOrder({
  userId: user?.id,
  items: cart.items.map(item => ({...})),
  totalAmount: total,
  shippingAddress: shippingData,
  phoneNumber: paymentData.phoneNumber,
  customerEmail: shippingData.email,
  customerName: `${shippingData.firstName} ${shippingData.lastName}`
})

if (!orderResult.success) {
  throw new Error('Failed to create order')
}
```

**Issues:**
- ❌ Custom function instead of service
- ❌ Duplicated logic between `cacBankService.createOrder()` and direct Supabase calls
- ❌ Inconsistent with Tommy-CK pattern

---

### **4. Payment Flow**

#### **Tommy-CK (Correct Pattern)**
```javascript
// Uses backend.payment service
const { backend } = useApp()

// 1. Create order first
const orderResult = await backend.orders.createOrder({...})
const orderId = orderResult.order.id

// 2. Initiate payment
const paymentResult = await backend.payment.initiatePayment({
  amount: total,
  phoneNumber: paymentData.phoneNumber,
  orderId: orderId,
  description: `Order #${orderId}`
})

if (paymentResult.success) {
  // 3. Show OTP input
  // 4. Confirm payment
  const confirmResult = await backend.payment.confirmPayment({
    paymentRequestId: paymentResult.paymentRequestId,
    otp: otp,
    phoneNumber: paymentData.phoneNumber
  })
  
  // 5. Update order
  await backend.orders.updateOrderPayment(orderId, {
    transactionId: confirmResult.transactionId,
    status: 'completed',
    paymentStatus: 'paid',
    paymentRequestId: paymentResult.paymentRequestId
  })
}
```

**Features:**
- ✅ Clean separation: orders service → payment service → orders service
- ✅ Uses `backend.payment.initiatePayment()` and `backend.payment.confirmPayment()`
- ✅ Uses `backend.orders.updateOrderPayment()` for status updates
- ✅ Token caching in PaymentService
- ✅ Test mode support

#### **Urban Jungle (Current)**
```javascript
// Uses cacBankService functions
import * as cacBankService from '../services/cacBankService'

// 1. Create order (custom function)
const orderResult = await cacBankService.createOrder({...})

// 2. Initiate payment (custom function)
const paymentResult = await cacBankService.initiatePayment({...})

// 3. Update order (custom function)
await cacBankService.updateOrderPayment(orderId, {...})

// 4. Verify payment (custom function)
await cacBankService.verifyPayment(transactionId)
```

**Issues:**
- ❌ Custom functions instead of service layer
- ❌ No token caching (authenticates every time)
- ❌ Inconsistent with package architecture
- ❌ Mixed responsibilities (cacBankService does both payment AND orders)

---

### **5. Database Schema**

#### **Tommy-CK Expected Schema**
```sql
-- Orders table (with prefix: urban_orders)
CREATE TABLE urban_orders (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id), -- Support both
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

#### **Urban Jungle Current Schema**
```sql
-- Based on current code usage
CREATE TABLE urban_orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- ✅ Present
  customer_id UUID, -- ❓ May be missing
  customer_name VARCHAR, -- ✅ Present
  customer_email VARCHAR, -- ✅ Present
  customer_phone VARCHAR, -- ✅ Present
  shipping_address JSONB, -- ✅ Present
  items JSONB, -- ✅ Present
  total_amount DECIMAL, -- ✅ Present
  currency VARCHAR, -- ❓ May be missing
  payment_method VARCHAR, -- ✅ Present
  payment_status VARCHAR, -- ✅ Present
  status VARCHAR, -- ✅ Present
  delivery_status VARCHAR, -- ❓ Extra field
  synced_to_erp BOOLEAN, -- ❓ Extra field
  store_name VARCHAR, -- ❓ Extra field
  transaction_id VARCHAR, -- ❓ May be missing
  cac_payment_request_id VARCHAR, -- ❓ May be missing
  created_at TIMESTAMP, -- ✅ Present
  updated_at TIMESTAMP, -- ❓ May be missing
  paid_at TIMESTAMP -- ❓ May be missing
);
```

**❌ Issues:**
- Missing `customer_id` field (only has `user_id`)
- May be missing `currency` field
- May be missing `transaction_id` and `cac_payment_request_id` fields
- May be missing `updated_at` and `paid_at` fields
- Has extra fields (`delivery_status`, `synced_to_erp`, `store_name`) that may not be needed

---

## 🎯 Action Plan: Migrate to Tommy-CK Architecture

### **Phase 1: Install & Setup Backend Package** ⚠️ CRITICAL

1. **Install the backend package:**
   ```bash
   # If package is local (npm link)
   npm link @gabfashion/ecommerce-backend
   
   # OR if published to npm
   npm install @gabfashion/ecommerce-backend
   ```

2. **Update `src/config/backend.js`:**
   ```javascript
   import { createEcommerceBackend, URBAN_CONFIG } from '@gabfashion/ecommerce-backend'
   
   export const backend = createEcommerceBackend({
     ...URBAN_CONFIG,
     supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
     supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
     tablePrefix: 'urban_',
     cacProxyUrl: import.meta.env.VITE_CAC_PROXY_URL || 'http://157.230.110.104/api/cacint',
     paymentTestMode: import.meta.env.VITE_PAYMENT_TEST_MODE === 'true',
     currency: 'DJF',
     paymentCredentials: {
       username: import.meta.env.VITE_CAC_USERNAME,
       password: import.meta.env.VITE_CAC_PASSWORD
     },
     paymentApiKeys: {
       app_key: import.meta.env.VITE_CAC_APP_KEY,
       api_key: import.meta.env.VITE_CAC_API_KEY
     },
     companyServicesId: import.meta.env.VITE_CAC_COMPANY_SERVICES_ID
   })
   
   export default backend
   ```

3. **Update `src/App.jsx`:**
   ```javascript
   import { AppProvider } from '@gabfashion/ecommerce-backend'
   import { backend } from './config/backend'
   
   const App = () => {
     return (
       <AppProvider backend={backend}>
         <Router>
           {/* Routes */}
         </Router>
       </AppProvider>
     )
   }
   ```

4. **Remove custom `src/context/AppContext.jsx`** (use package version)

---

### **Phase 2: Fix Database Schema** ⚠️ CRITICAL

1. **Check current schema:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'urban_orders'
   ORDER BY ordinal_position;
   ```

2. **Add missing fields:**
   ```sql
   -- Add customer_id if missing
   ALTER TABLE urban_orders
   ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);
   
   -- Add currency if missing
   ALTER TABLE urban_orders
   ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'DJF';
   
   -- Add transaction_id if missing
   ALTER TABLE urban_orders
   ADD COLUMN IF NOT EXISTS transaction_id VARCHAR;
   
   -- Add cac_payment_request_id if missing
   ALTER TABLE urban_orders
   ADD COLUMN IF NOT EXISTS cac_payment_request_id VARCHAR;
   
   -- Add updated_at if missing
   ALTER TABLE urban_orders
   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
   
   -- Add paid_at if missing
   ALTER TABLE urban_orders
   ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
   ```

3. **Create migration trigger for updated_at:**
   ```sql
   -- Auto-update updated_at on row update
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   CREATE TRIGGER update_urban_orders_updated_at
   BEFORE UPDATE ON urban_orders
   FOR EACH ROW
   EXECUTE FUNCTION update_updated_at_column();
   ```

---

### **Phase 3: Update Checkout Pages** ⚠️ CRITICAL

1. **Update `CheckoutWithCAC.jsx`:**
   ```javascript
   import { useApp } from '@gabfashion/ecommerce-backend'
   
   const CheckoutWithCAC = () => {
     const { state, backend } = useApp()
     const { cart, user } = state
     
     // Create order using service
     const orderResult = await backend.orders.createOrder({
       userId: user?.id,
       items: cart.items.map(item => ({
         item_code: item.itemCode || item.id,
         name: item.name,
         quantity: item.quantity,
         price: item.price,
         size: item.size,
         color: item.color,
         image: item.image
       })),
       totalAmount: total,
       shippingAddress: shippingData,
       phoneNumber: paymentData.phoneNumber,
       customerEmail: shippingData.email,
       customerName: `${shippingData.firstName} ${shippingData.lastName}`,
       currency: 'DJF',
       paymentMethod: 'CAC Bank Mobile Money'
     })
     
     if (!orderResult.success) {
       throw new Error(orderResult.error || 'Failed to create order')
     }
     
     const orderId = orderResult.order.id
     
     // Initiate payment using service
     const paymentResult = await backend.payment.initiatePayment({
       amount: total,
       phoneNumber: paymentData.phoneNumber,
       orderId: orderId,
       description: `Urban Jungle - Order ${cart.items.length} items`
     })
     
     // ... rest of payment flow
   }
   ```

2. **Update `CheckoutCOD.jsx`:**
   ```javascript
   import { useApp } from '@gabfashion/ecommerce-backend'
   
   const CheckoutCOD = () => {
     const { state, backend } = useApp()
     const { cart, user } = state
     
     // Create order using service
     const orderResult = await backend.orders.createOrder({
       userId: user?.id,
       items: cart.items.map(item => ({...})),
       totalAmount: total,
       shippingAddress: shippingData,
       phoneNumber: shippingData.phone,
       customerEmail: shippingData.email,
       customerName: `${shippingData.firstName} ${shippingData.lastName}`,
       currency: 'DJF',
       paymentMethod: 'Cash on Delivery'
     })
     
     if (!orderResult.success) {
       toast.error(orderResult.error || 'Failed to place order')
       return
     }
     
     // Update order status to confirmed for COD
     await backend.orders.updateOrderStatus(orderResult.order.id, 'confirmed')
     
     // Clear cart and redirect
     actions.clearCart()
     navigate(`/payment-success?orderId=${orderResult.order.id}`)
   }
   ```

3. **Remove `src/services/cacBankService.js`** (use `backend.payment` instead)

---

### **Phase 4: Update Other Services** ✅ OPTIONAL

1. **Update favorites to use `backend.favorites`**
2. **Update products to use `backend.products`**
3. **Update cart to use `backend.cart`** (if needed)

---

## 📋 Migration Checklist

### **Critical (Must Do)**
- [ ] Install `@gabfashion/ecommerce-backend` package
- [ ] Update `src/config/backend.js` to use package
- [ ] Update `src/App.jsx` to use `AppProvider` from package
- [ ] Remove custom `src/context/AppContext.jsx`
- [ ] Fix `urban_orders` table schema (add missing fields)
- [ ] Update `CheckoutWithCAC.jsx` to use `backend.orders` and `backend.payment`
- [ ] Update `CheckoutCOD.jsx` to use `backend.orders`
- [ ] Remove `src/services/cacBankService.js`
- [ ] Test order creation
- [ ] Test payment flow

### **Important (Should Do)**
- [ ] Update favorites to use `backend.favorites`
- [ ] Update products to use `backend.products`
- [ ] Test all checkout flows
- [ ] Verify database schema matches package expectations

### **Optional (Nice to Have)**
- [ ] Remove unused custom services
- [ ] Clean up duplicate code
- [ ] Add error monitoring
- [ ] Add analytics tracking

---

## 🚨 Potential Issues & Solutions

### **Issue 1: Package Not Available**
**Solution:** If `@gabfashion/ecommerce-backend` is not published, we can:
1. Copy the services from `ecommerce-backend updated/` directory
2. Create a local package
3. Use npm link

### **Issue 2: Schema Mismatch**
**Solution:** Run the migration SQL to add missing fields before switching to package

### **Issue 3: Breaking Changes**
**Solution:** Test thoroughly in development before deploying

---

## 🎯 Expected Benefits

After migration:
- ✅ Consistent architecture with Tommy-CK
- ✅ Standardized service layer
- ✅ Better error handling
- ✅ Token caching for payments
- ✅ Easier maintenance
- ✅ Better testability
- ✅ Consistent database schema

---

## 📝 Next Steps

1. **Review this document** with the team
2. **Decide on package availability** (npm link vs published)
3. **Run database migration** to fix schema
4. **Start Phase 1** (install package)
5. **Test incrementally** after each phase
6. **Deploy after full testing**

---

**Status:** ⚠️ **READY FOR MIGRATION** - All issues identified, action plan created


