# 🔐 Nike Outlet Authentication System

## 🚀 What We Built

A complete JWT-based authentication system that integrates with your existing ERPNext backend, designed specifically for your multi-brand outlet store (Nike, Adidas, Converse, Jordan).

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                Frontend (React)              │
│  • AuthModal (Login/Register)               │
│  • AppContext (State Management)            │
│  • AuthService (API Communication)          │
│  • Navigation (User Menu)                   │
└─────────────────┬───────────────────────────┘
                  │ JWT Tokens
┌─────────────────▼───────────────────────────┐
│              Backend (Flask)                │
│  • JWT Authentication                       │
│  • Password Hashing (bcrypt)                │
│  • ERPNext Customer Integration             │
│  • Multi-brand Product APIs                 │
└─────────────────┬───────────────────────────┘
                  │ Customer/Product Data
┌─────────────────▼───────────────────────────┐
│               ERPNext                       │
│  • Customer Management                      │
│  • Nike/Adidas/Converse/Jordan Products     │
│  • Order Management                         │
└─────────────────────────────────────────────┘
```

## 🔧 Backend Implementation

### New Files Created:
- `backend/auth.py` - Authentication manager with JWT/ERPNext integration
- `backend/user_auth.json` - Simple file-based user storage (demo purposes)
- `backend/test_auth.py` - Testing script

### API Endpoints Added:
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/verify       - Token verification
GET  /api/auth/profile      - User profile
GET  /api/products/brands   - Available brands
GET  /api/products/brand/:brand - Products by brand
GET  /api/user/orders       - User orders (protected)
```

### Features:
- ✅ JWT token-based authentication (24-hour expiry)
- ✅ Password hashing with bcrypt
- ✅ ERPNext customer creation on registration
- ✅ Multi-brand product filtering
- ✅ Protected routes with decorator
- ✅ Comprehensive error handling

## 🎨 Frontend Implementation

### New Files Created:
- `src/services/authService.js` - Authentication service
- `src/components/AuthModal.jsx` - Login/Register modal

### Enhanced Files:
- `src/context/AppContext.jsx` - Added auth state management
- `src/components/EcommerceNav.jsx` - Added auth UI and user menu

### Features:
- ✅ Beautiful login/register modal with animations
- ✅ Form validation and error handling
- ✅ User dropdown menu in navigation
- ✅ Protected route capabilities
- ✅ Persistent authentication state
- ✅ Toast notifications for user feedback

## 🚦 How to Start the System

### 1. Start Backend:
```bash
cd backend
python app.py
```
The Flask server runs on `http://127.0.0.1:5000`

### 2. Start Frontend:
```bash
npm run dev
```
The React app runs on `http://localhost:5173`

### 3. Test Authentication:
```bash
cd backend
python test_auth.py
```

## 🔐 User Flow

### Registration:
1. User clicks "Join Us" in navigation
2. Fills registration form (email, password, name)
3. System creates ERPNext customer
4. Returns JWT token and user data
5. User is automatically logged in

### Login:
1. User clicks "Sign In" in navigation
2. Enters email and password
3. System validates credentials
4. Returns JWT token and user data
5. User gains access to protected features

### Authenticated Features:
- ✅ User profile dropdown
- ✅ Access to checkout process
- ✅ Order history (when implemented)
- ✅ Wishlist sync across devices
- ✅ Personalized experience

## 🎯 Perfect for Your Outlet Store

### Multi-Brand Support:
```javascript
// Get all brands
const brands = await authService.getBrands();
// Returns: ['Nike', 'Adidas', 'Converse', 'Jordan']

// Get brand-specific products
const nikeProducts = await authService.getProductsByBrand('Nike');
const adidasProducts = await authService.getProductsByBrand('Adidas');
```

### Customer Integration:
- Every registered user becomes an ERPNext customer
- Orders can be synced to ERPNext sales orders
- Customer data consistency across systems

## 🔒 Security Features

- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Protected API endpoints
- ✅ Automatic token verification

## 🚀 Next Steps

### Production Improvements:
1. **Database**: Replace file storage with proper database
2. **Environment Variables**: Use .env for JWT secret
3. **Email Verification**: Add email confirmation flow
4. **Password Reset**: Implement forgot password feature
5. **Social Login**: Add Google/Facebook authentication
6. **Rate Limiting**: Add API rate limiting
7. **Logging**: Implement proper logging system

### Feature Enhancements:
1. **User Profile Management**: Full profile editing
2. **Order History**: Complete order tracking
3. **Wishlist Sync**: Advanced wishlist features
4. **Loyalty Program**: Points and rewards system
5. **Admin Panel**: User management interface

## 🎉 Testing the System

### Manual Testing:
1. Open `http://localhost:5173`
2. Click "Join Us" to register
3. Fill the form and submit
4. Check navigation for user dropdown
5. Test logout and login

### API Testing:
```bash
# Test registration
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nike.com","password":"testpass123","first_name":"Test","last_name":"User"}'

# Test login
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nike.com","password":"testpass123"}'
```

## 💡 Key Benefits

1. **Seamless Integration**: Works with your existing ERPNext setup
2. **Scalable**: Ready for multi-brand expansion
3. **Modern UX**: Beautiful authentication experience
4. **Secure**: Industry-standard security practices
5. **Extensible**: Easy to add new features
6. **Mobile Ready**: Responsive design for all devices

Your Nike outlet store now has a complete authentication system ready for Nike, Adidas, Converse, and Jordan customers! 🎊 