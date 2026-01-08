# Testing Stock Validation - Complete Guide

**Date:** January 7, 2026  
**Status:** ✅ Ready for Testing

---

## Overview

This guide covers how to test the real-time stock validation system that prevents overselling. The system validates stock from ERPNext directly at checkout, not from cached Supabase data.

---

## Prerequisites

1. **Edge Function Deployed**: `verify-stock-uj` should be deployed to Supabase
2. **Environment Variables**: Ensure these are set in Supabase Edge Function secrets:
   - `ERP_BASE_URL` - Your ERPNext URL
   - `ERP_API_KEY` - ERPNext API key
   - `ERP_SECRET_KEY` - ERPNext API secret
   - `SUPABASE_URL` - Supabase project URL
   - `SUPABASE_ANON_KEY` - Supabase anon key

3. **Test Products**: Have at least one product with known stock quantity in ERPNext (warehouse: `UJ - GFH`)

---

## Test 1: Direct Edge Function Test

Test the Edge Function directly using curl or Postman.

### Using curl:

```bash
# Replace with your actual Supabase URL and anon key
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
ITEM_CODE="your-test-item-code"

curl -X POST "${SUPABASE_URL}/functions/v1/verify-stock-uj" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "test-1",
        "item_code": "'${ITEM_CODE}'",
        "quantity": 1
      }
    ]
  }'
```

### Expected Response (Success):

```json
{
  "all_available": true,
  "items": [
    {
      "item_code": "YOUR_ITEM_CODE",
      "requested": 1,
      "available": 5,
      "is_available": true,
      "display_stock": 3,
      "source": "erpnext"
    }
  ],
  "checked_at": "2026-01-07T10:00:00.000Z",
  "source": "erpnext"
}
```

### Expected Response (Out of Stock):

```json
{
  "all_available": false,
  "items": [
    {
      "item_code": "YOUR_ITEM_CODE",
      "requested": 10,
      "available": 3,
      "is_available": false,
      "display_stock": 1,
      "source": "erpnext"
    }
  ],
  "checked_at": "2026-01-07T10:00:00.000Z",
  "source": "erpnext"
}
```

---

## Test 2: Checkout Flow Tests

### Test 2.1: Sufficient Stock → Should Proceed

**Steps:**
1. Go to your website (e.g., `urbanjungle.dj`)
2. Add a product to cart (ensure it has stock in ERPNext)
3. Go to checkout (COD or CAC)
4. Fill in shipping details
5. Click "Place Order" or "Send OTP"

**Expected Result:**
- ✅ Order should be created successfully
- ✅ No stock error messages
- ✅ Order appears in Supabase `orders` table

**What to Check:**
- Browser console: Should see stock verification call
- Network tab: Should see `verify-stock-uj` function call
- Response should show `all_available: true`

---

### Test 2.2: Insufficient Stock → Should Block

**Steps:**
1. Find a product with low stock (e.g., 2 items)
2. Add more than available stock to cart (e.g., 5 items)
3. Go to checkout
4. Fill in shipping details
5. Click "Place Order" or "Send OTP"

**Expected Result:**
- ❌ Order should NOT be created
- ❌ Error toast: "Some items are out of stock: [item_code]: 5 requested but only 2 available"
- ✅ User stays on checkout page
- ✅ Cart remains unchanged

**What to Check:**
- Browser console: Should see stock verification call
- Network tab: Should see `verify-stock-uj` function call
- Response should show `all_available: false`
- Error message should be clear and specific

---

### Test 2.3: Real-Time Stock Update (Physical Sale)

**Scenario:** Test that website sees physical store sales immediately

**Steps:**
1. Note current stock of a product in ERPNext (e.g., 5 items)
2. Add that product to cart on website (quantity: 1)
3. **Before checkout**, go to ERPNext and create a physical sale:
   - Create a Sales Invoice or Delivery Note
   - Reduce stock by 1 (now 4 items in ERPNext)
4. Go back to website checkout
5. Click "Place Order" or "Send OTP"

**Expected Result:**
- ✅ Checkout should proceed (1 item requested, 4 available)
- ✅ Website sees updated stock (4) from ERPNext, not cached (5)

**What to Check:**
- Network tab: `verify-stock-uj` response should show `source: "erpnext"`
- Stock quantity should match ERPNext (4), not Supabase cache (5)
- This proves real-time validation is working!

---

### Test 2.4: Concurrent Checkouts (Race Condition)

**Scenario:** Two users try to buy the last item simultaneously

**Steps:**
1. Find a product with stock = 1 in ERPNext
2. **User A**: Add to cart, go to checkout, fill details
3. **User B** (different browser/incognito): Add same product, go to checkout
4. **User A**: Click "Place Order" first
5. **User B**: Click "Place Order" immediately after

**Expected Result:**
- ✅ User A: Order created successfully
- ❌ User B: Error "Some items are out of stock: [item_code]: 1 requested but only 0 available"
- ✅ Only one order should be created

**What to Check:**
- Both users should see stock verification calls
- User A's call should succeed
- User B's call should fail (stock already reserved/used)
- This proves overselling protection works!

---

### Test 2.5: ERPNext Unavailable → Fallback

**Scenario:** Test graceful fallback when ERPNext is down

**Steps:**
1. Temporarily block ERPNext access (or use wrong API credentials)
2. Add product to cart
3. Go to checkout
4. Click "Place Order" or "Send OTP"

**Expected Result:**
- ⚠️ Should use Supabase cache as fallback
- ✅ Checkout should still work (using cached data)
- ⚠️ Response should show `source: "supabase_cache"`
- ⚠️ Warning message: "Stock data may be slightly outdated"

**What to Check:**
- Browser console: Should see warning about ERPNext unavailable
- Network tab: Response should show `source: "supabase_cache"`
- Checkout should still proceed (graceful degradation)

---

## Test 3: Payment Method Specific Tests

### Test 3.1: Cash on Delivery (COD)

**File:** `src/pages/CheckoutCOD.jsx`

**Steps:**
1. Add items to cart
2. Go to `/checkout-cod`
3. Fill shipping form
4. Click "Place Order"

**What to Check:**
- Stock validation happens BEFORE order creation
- If stock insufficient → order NOT created
- If stock sufficient → order created with `payment_status: 'pending'`

---

### Test 3.2: CAC Bank Payment

**File:** `src/pages/CheckoutWithCAC.jsx`

**Steps:**
1. Add items to cart
2. Go to `/checkout-cac`
3. Fill shipping form → Continue
4. Enter phone number → Send OTP

**What to Check:**
- Stock validation happens BEFORE payment initiation
- If stock insufficient → payment NOT initiated, no OTP sent
- If stock sufficient → OTP sent, payment proceeds

---

### Test 3.3: Payment Form (Stripe/Demo)

**File:** `src/components/PaymentForm.jsx`

**Steps:**
1. Add items to cart
2. Go to checkout page using PaymentForm
3. Fill payment details
4. Click "Complete Order"

**What to Check:**
- Stock validation happens BEFORE payment processing
- If stock insufficient → payment blocked
- If stock sufficient → payment proceeds

---

## Test 4: Browser Console Monitoring

### Enable Console Logging

Open browser DevTools (F12) → Console tab

**What to Look For:**

1. **Stock Verification Call:**
   ```
   🔍 Checking stock from ERPNext for X items (warehouse: UJ - GFH)
   ✅ Stock verified from ERPNext (source of truth)
   ```

2. **Stock Check Response:**
   ```javascript
   {
     all_available: true,
     items: [...],
     source: "erpnext" // or "supabase_cache"
   }
   ```

3. **Error Messages:**
   ```
   ❌ Some items are out of stock: [item_code]: X requested but only Y available
   ```

---

## Test 5: Network Tab Monitoring

### Check Network Requests

Open DevTools → Network tab → Filter: `verify-stock-uj`

**What to Check:**

1. **Request:**
   - Method: `POST`
   - URL: `https://[project].supabase.co/functions/v1/verify-stock-uj`
   - Headers: `Authorization: Bearer [anon-key]`
   - Body: `{ items: [{ id, item_code, quantity }] }`

2. **Response:**
   - Status: `200 OK`
   - Body: JSON with `all_available`, `items`, `source`
   - Timing: Should be < 2 seconds (ERPNext query)

3. **Error Response:**
   - Status: `400` or `500`
   - Body: Error message
   - Should show fallback to Supabase if ERPNext fails

---

## Test 6: Supabase Dashboard Monitoring

### Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to: **Edge Functions** → **verify-stock-uj** → **Logs**

**What to Look For:**

1. **Successful Calls:**
   ```
   🔍 Checking stock from ERPNext for X items (warehouse: UJ - GFH)
   ✅ Stock verified from ERPNext (source of truth)
   ```

2. **Fallback Calls:**
   ```
   ⚠️ ERPNext unavailable (error message), using Supabase cache
   ✅ Using Supabase cache as fallback
   ```

3. **Errors:**
   ```
   ❌ Stock verification error: [error message]
   ```

---

## Test 7: Database Verification

### Check Stock Reservation

After successful checkout, verify stock is reserved:

```sql
-- Check urban_products table
SELECT 
  item_code,
  product_name,
  stock_quantity,
  reserved_quantity,
  (stock_quantity - reserved_quantity) as available_stock
FROM urban_products
WHERE item_code = 'YOUR_TEST_ITEM_CODE';
```

**Expected:**
- `reserved_quantity` should increase after checkout
- `available_stock` should decrease
- This prevents double-booking

---

## Test 8: End-to-End Scenario

### Complete Flow Test

**Scenario:** Full customer journey with stock validation

**Steps:**
1. **Browse Products**: User sees products with stock from Supabase (may be 10 min old)
2. **Add to Cart**: User adds product (stock: 5 shown)
3. **Physical Sale**: Meanwhile, physical store sells 2 items (ERPNext: 3 items)
4. **Checkout**: User goes to checkout
5. **Stock Validation**: System queries ERPNext → sees 3 items (real-time!)
6. **Order Creation**: User wants 1 item → ✅ Proceeds (3 > 1)
7. **Stock Reserved**: Stock reserved in `urban_products` table
8. **Order Created**: Order created in `orders` table

**Expected Result:**
- ✅ User sees cached stock (5) while browsing
- ✅ Checkout validates against real stock (3)
- ✅ Order succeeds because 3 > 1
- ✅ Stock properly reserved
- ✅ No overselling!

---

## Quick Test Checklist

Use this checklist for quick validation:

- [ ] Edge Function responds to direct API call
- [ ] Checkout with sufficient stock → proceeds
- [ ] Checkout with insufficient stock → blocked
- [ ] Physical sale → website sees updated stock immediately
- [ ] Concurrent checkouts → only first succeeds
- [ ] ERPNext unavailable → falls back to Supabase gracefully
- [ ] Browser console shows stock verification calls
- [ ] Network tab shows `verify-stock-uj` requests
- [ ] Supabase logs show function execution
- [ ] Stock reservation works correctly

---

## Troubleshooting

### Issue: Edge Function returns 401 Unauthorized

**Solution:**
- Check Supabase anon key is correct
- Verify Edge Function is deployed
- Check CORS headers in function

### Issue: Always uses Supabase cache (never ERPNext)

**Solution:**
- Check ERPNext credentials in Supabase secrets
- Verify `ERP_BASE_URL`, `ERP_API_KEY`, `ERP_SECRET_KEY` are set
- Check ERPNext API is accessible
- Look for errors in Supabase function logs

### Issue: Stock validation not blocking checkout

**Solution:**
- Check browser console for errors
- Verify `verify-stock-uj` is being called
- Check response shows `all_available: false`
- Verify checkout code checks `all_available` before proceeding

### Issue: Stock shows as available but checkout fails

**Solution:**
- Check stock buffer (2 units reserved)
- Verify warehouse is `UJ - GFH` in ERPNext
- Check item_code matches exactly
- Look for reserved_quantity reducing available stock

---

## Success Criteria

✅ **All tests pass** = Stock validation is working correctly!

**Key Indicators:**
1. ✅ Real-time stock from ERPNext (not cached)
2. ✅ Checkout blocked when insufficient stock
3. ✅ No overselling (concurrent checkouts protected)
4. ✅ Graceful fallback when ERPNext unavailable
5. ✅ Clear error messages for users

---

## Next Steps After Testing

1. **Monitor Production**: Watch Supabase function logs for errors
2. **Track Overselling**: Check if any orders are created with insufficient stock
3. **Performance**: Monitor function response times
4. **User Feedback**: Collect feedback on error messages
5. **Optimize**: Adjust stock buffer if needed (currently 2 units)

---

**Last Updated:** January 7, 2026  
**Status:** ✅ Ready for Testing

