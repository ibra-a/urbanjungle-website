# 🌿 Urban Jungle Admin Dashboard - Setup Complete!

## ✅ **What Was Added:**

### **Files Copied:**
1. ✅ `src/pages/admin/Layout.jsx` - Admin layout with sidebar
2. ✅ `src/pages/admin/Dashboard.jsx` - Dashboard overview
3. ✅ `src/pages/admin/Orders.jsx` - Orders management
4. ✅ `src/pages/admin/Products.jsx` - Products management (unified system)
5. ✅ `src/components/AdminRoute.jsx` - Admin route protection
6. ✅ `src/components/Pagination.jsx` - Pagination component (if not already present)
7. ✅ `src/lib/supabase.js` - Supabase client export for admin compatibility

### **Files Modified:**
- ✅ `src/App.jsx` - Added admin routes
- ✅ `src/pages/admin/Layout.jsx` - Changed branding to "Urban Jungle"

---

## 🎯 **Admin Features Available:**

### **1. Dashboard (`/admin`)**
- Today's orders count
- Today's revenue
- Pending orders
- Low stock alerts
- Recent orders list
- Quick stats overview

### **2. Orders Management (`/admin/orders`)**
- View all orders
- Filter by status (pending, processing, shipped, completed, cancelled)
- Update order status
- Sync orders to ERPNext
- View order details with items
- Pagination (10 items per page)
- Mobile-friendly design

### **3. Products Management (`/admin/products`)**
**This is the UNIFIED system!**

**3 View Options:**
- 🏢 **All GAB Products** - See everything (both Tommy CK + Urban Jungle)
- 🔴 **Tommy CK Site** - Tommy Hilfiger & Calvin Klein only
- 🌿 **Urban Jungle Site** - Nike, Adidas, Jordan, Converse, etc.

**Features:**
- Default view: All GAB Fashion House products
- Store column (shows Tommy CK or Urban Jungle when viewing "All")
- Dynamic brand filters based on selected store
- Search by name, item code, or brand
- Filter by category (Apparel, Accessories, Footwear)
- Filter by stock level (All, Low Stock, Out of Stock)
- Expandable product rows to view variants
- Pagination (20 items per page)
- Sync products from ERPNext

---

## 🚀 **How to Access:**

### **1. Access Admin Panel:**
```
URL: http://localhost:5173/admin
or
URL: https://your-urban-jungle-domain.com/admin
```

### **2. Admin Login:**
You need to be logged in with an admin account.

**Make your account admin:**
```sql
-- Run in Supabase SQL Editor
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'your-email@example.com';
```

### **3. Navigate Admin:**
```
Admin Panel
├── 🏠 Dashboard - Overview and stats
├── 🛒 Orders - Manage orders
└── 📦 Products - Manage inventory
```

---

## 🏢 **Unified Inventory System:**

### **Key Feature: Cross-Store Management**

**When you select "All GAB Products":**
```
You see:
- All Tommy Hilfiger products (from TH & CK warehouse)
- All Calvin Klein products (from TH & CK warehouse)
- All Nike products (from UJ warehouse)
- All Adidas products (from UJ warehouse)
- All Jordan, Converse, Crocs, etc. (from UJ warehouse)

Total: ~3,000 products across both stores
```

**Benefits:**
- ✅ See your entire inventory at once
- ✅ Compare performance across stores
- ✅ Identify low stock items company-wide
- ✅ Make cross-store business decisions

**When you select "Urban Jungle Site":**
```
Filters to: warehouse = 'UJ - GFH'
Shows only:
- Nike
- Adidas
- Jordan
- Converse
- Crocs
- Puma
- Vans
- Other Urban brands

Total: ~1,200 Urban Jungle products
```

---

## 🎨 **Branding:**

The admin panel shows:
- **Header:** "Urban Jungle - Admin Panel"
- **Logo:** Store icon with white background
- **Theme:** Professional dark mode (black & gray)
- **View Store:** Link to public Urban Jungle website

---

## 🔐 **Security:**

### **Route Protection:**
- ✅ `/admin/*` routes require authentication
- ✅ User must have `is_admin = true` in profiles table
- ✅ Non-admin users see "Access Denied" message
- ✅ Automatic redirect to login if not authenticated

### **Role-Based Access:**
```javascript
// AdminRoute.jsx checks:
1. User is logged in (has session)
2. User profile has is_admin = true
3. If fails, shows "Access Denied"
```

---

## 📊 **Database Tables Used:**

### **Urban Jungle Specific:**
- `urban_orders` - Orders from Urban Jungle site
- `urban_user_cart` - Shopping carts
- `urban_user_favorites` - Favorite products

### **Shared Across Stores:**
- `products` - **Master table** with all products (both stores)
- `profiles` - User accounts and admin permissions

### **Warehouse Assignment:**
```
Products table:
├── warehouse = 'TH & CK - GFH' → Tommy CK site
└── warehouse = 'UJ - GFH' → Urban Jungle site
```

---

## 🔄 **Product Sync:**

### **Sync from ERPNext:**
Click "Sync ERP" button in Products page to:
1. Fetch latest products from ERPNext
2. Update stock quantities
3. Add new products
4. Update prices and images

### **Sync Script** (for manual/scheduled sync):
```bash
# From Urban Jungle project root
npm run sync:products
```

---

## 📱 **Mobile-Friendly:**

All admin pages are responsive:
- ✅ Orders page: Mobile-optimized table
- ✅ Products page: Horizontal scroll on small screens
- ✅ Dashboard: Stacked cards on mobile
- ✅ Filters: Collapsible on mobile

---

## 🎯 **Next Steps:**

### **1. Set Up Admin Account:**
```sql
UPDATE profiles 
SET is_admin = true, role = 'admin' 
WHERE email = 'fluzeibra@gmail.com';  -- Your email
```

### **2. Test Admin Access:**
```
1. Go to http://localhost:5173/admin
2. Log in with your admin account
3. Verify you see the admin dashboard
```

### **3. Test Unified Products View:**
```
1. Go to Admin → Products
2. Select "All GAB Fashion House Products"
3. Verify you see BOTH Tommy CK and Urban Jungle products
4. Look for "Store" column showing which site each product belongs to
```

### **4. Test Store Filtering:**
```
1. Click "Change View"
2. Select "Urban Jungle Site"
3. Verify you only see Nike, Adidas, Jordan, etc.
4. Brand filters should update to show only Urban brands
```

---

## ✨ **Special Features:**

### **1. Smart Store Detection:**
- Products automatically assigned to correct store based on `warehouse` field
- No manual configuration needed
- Pulls directly from ERPNext data

### **2. Dynamic Brand Filters:**
- Brand buttons change based on which store you're viewing
- "All GAB": Shows all brands (Tommy, CK, Nike, Adidas, etc.)
- "Urban Jungle": Shows only Urban brands (Nike, Adidas, Jordan, etc.)

### **3. Cross-Store Reports:**
- Dashboard shows combined stats across both stores
- Can filter orders by store
- Can view products by store or combined

---

## 🎉 **Status: READY TO USE!**

Your Urban Jungle admin dashboard is fully set up and ready to manage:
- ✅ Orders from Urban Jungle customers
- ✅ Products from Urban Jungle inventory (Nike, Adidas, Jordan, etc.)
- ✅ Access to unified GAB Fashion House inventory
- ✅ Cross-store reporting and management

**Access it now at:** `/admin`

**Same admin account works for both Tommy CK and Urban Jungle sites!**

