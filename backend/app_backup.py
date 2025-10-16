from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import requests
import os
import time
from urllib.parse import urljoin
import json

# Import authentication
from auth import AuthManager, require_auth

app = Flask(__name__)
CORS(app)

# ERPNext Configuration
BASE_URL = "https://sdcnike.frappe.cloud"
USERNAME = "fluzeibra@gmail.com"
PASSWORD = "erpnext#789"

# Initialize Auth Manager
auth_manager = AuthManager(BASE_URL, USERNAME, PASSWORD)
app.auth_manager = auth_manager

# Global cache variables
cached_products = []
cached_cookies = None
last_fetch_time = 0
CACHE_DURATION = 300  # 5 minutes in seconds

def login_to_erpnext():
    """Login to ERPNext and return session cookies"""
    global cached_cookies
    
    try:
        session = requests.Session()
        
        # Get login page to extract any required tokens
        login_page = session.get(f"{BASE_URL}/login")
        
        # Login payload
        login_data = {
            'cmd': 'login',
            'usr': USERNAME,
            'pwd': PASSWORD
        }
        
        # Perform login
        response = session.post(f"{BASE_URL}/", data=login_data)
        
        if response.status_code == 200:
            cached_cookies = session.cookies
            print("Login successful!")
            return session.cookies
        else:
            print(f"Login failed with status: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return None

def fetch_nike_products():
    """Fetch Nike products from ERPNext"""
    global cached_products, last_fetch_time
    
    current_time = time.time()
    
    # Check if cache is still valid
    if cached_products and (current_time - last_fetch_time) < CACHE_DURATION:
        return cached_products
    
    try:
        # Get fresh cookies if needed
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return []
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Query Items directly with simple Nike filter (simplified for now)
        query_url = f"{BASE_URL}/api/resource/Item"
        params = {
            'fields': '["item_code", "item_name", "item_group", "standard_rate", "image", "description"]',
            'filters': '[["item_group", "like", "%Nike%"]]',
            'limit': 20
        }
        
        print(f"Querying Nike Items...")
        response = session.get(query_url, params=params)
        
        if response.status_code == 200:
            items_data = response.json().get('data', [])
            print(f"Found {len(items_data)} Nike items")
            
            # For now, just return first few Nike items with placeholder stock
            # We'll add proper stock checking once we verify this works
            nike_products = []
            
            for item in items_data[:20]:  # First 20 items
                product = {
                    'item_code': item.get('item_code'),
                    'item_name': item.get('item_name', 'Nike Product'),
                    'price': item.get('standard_rate', 200.00),
                    'stock_qty': 5,  # Placeholder stock for now
                    'image': item.get('image', ''),
                    'description': item.get('description', ''),
                    'item_group': item.get('item_group', '')
                }
                nike_products.append(product)
                print(f"✅ Added Nike product: {item.get('item_code')} - {item.get('item_group')}")
            
            print(f"Total Nike products: {len(nike_products)}")
            cached_products = nike_products
            last_fetch_time = current_time
            return nike_products
            
        else:
            print(f"Failed to fetch Nike items: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return cached_products or []
            
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return cached_products or []

def download_product_image(item_code):
    """Download and cache product image"""
    try:
        # Create images directory
        os.makedirs('item_images', exist_ok=True)
        
        image_path = f"item_images/{item_code}.jpg"
        
        # Check if image already exists
        if os.path.exists(image_path):
            return image_path
        
        # Get fresh cookies if needed
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return None
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Get item details to find image URL
        item_url = f"{BASE_URL}/api/resource/Item/{item_code}"
        response = session.get(item_url)
        
        if response.status_code == 200:
            item_data = response.json().get('data', {})
            image_url = item_data.get('image')
            
            if image_url:
                # Make image URL absolute
                if image_url.startswith('/'):
                    image_url = urljoin(BASE_URL, image_url)
                
                # Download image
                img_response = session.get(image_url)
                if img_response.status_code == 200:
                    with open(image_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"Downloaded image for {item_code}: {len(img_response.content)} bytes")
                    return image_path
        
        return None
        
    except Exception as e:
        print(f"Error downloading image for {item_code}: {str(e)}")
        return None

# API Routes

@app.route('/api/debug/stock', methods=['GET'])
def debug_stock_balance():
    """Debug endpoint to check Stock Balance API response"""
    try:
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return jsonify({'error': 'Authentication failed'}), 401
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Query for items with stock balance > 0 (limited for debugging)
        query_url = f"{BASE_URL}/api/resource/Stock Balance"
        params = {
            'fields': '["item_code", "qty_after_transaction", "item_name"]',
            'filters': '[["qty_after_transaction", ">", 0]]',
            'limit': 10  # Just first 10 for debugging
        }
        
        response = session.get(query_url, params=params)
        
        if response.status_code == 200:
            stock_data = response.json()
            return jsonify({
                'success': True,
                'status_code': response.status_code,
                'data_type': type(stock_data).__name__,
                'data_keys': list(stock_data.keys()) if isinstance(stock_data, dict) else 'not_dict',
                'first_few_items': stock_data.get('data', [])[:3] if isinstance(stock_data, dict) else stock_data[:3],
                'total_items': len(stock_data.get('data', [])) if isinstance(stock_data, dict) else len(stock_data)
            })
        else:
            return jsonify({
                'success': False,
                'status_code': response.status_code,
                'response_text': response.text[:500]
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/items', methods=['GET'])
def debug_nike_items():
    """Debug endpoint to test Nike Items query"""
    try:
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return jsonify({'error': 'Authentication failed'}), 401
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Test simple Item query first
        query_url = f"{BASE_URL}/api/resource/Item"
        params = {
            'fields': '["item_code", "item_name", "item_group"]',
            'filters': '[["item_group", "like", "%Nike%"]]',
            'limit': 5
        }
        
        response = session.get(query_url, params=params)
        
        if response.status_code == 200:
            items_data = response.json()
            return jsonify({
                'success': True,
                'status_code': response.status_code,
                'total_items': len(items_data.get('data', [])),
                'items': items_data.get('data', [])
            })
        else:
            return jsonify({
                'success': False,
                'status_code': response.status_code,
                'response_text': response.text[:500]
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask ERPNext API is running',
        'cache_status': f"{len(cached_products)} products cached",
        'last_update': last_fetch_time
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all Nike products"""
    products = fetch_nike_products()
    return jsonify({
        'products': products,
        'count': len(products),
        'cached': (time.time() - last_fetch_time) < CACHE_DURATION
    })

@app.route('/api/test/<item_code>', methods=['GET'])
def test_single_item(item_code):
    """Test endpoint for single item"""
    try:
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return jsonify({'error': 'Authentication failed'}), 401
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Get item details
        item_url = f"{BASE_URL}/api/resource/Item/{item_code}"
        response = session.get(item_url)
        
        if response.status_code == 200:
            item_data = response.json().get('data', {})
            return jsonify({
                'success': True,
                'item_code': item_code,
                'data': item_data
            })
        else:
            return jsonify({'error': f'Item not found: {response.status_code}'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<item_code>', methods=['GET'])
def get_item_image(item_code):
    """Serve product image"""
    image_path = download_product_image(item_code)
    
    if image_path and os.path.exists(image_path):
        return send_file(image_path, mimetype='image/jpeg')
    else:
        return jsonify({'error': 'Image not found'}), 404

@app.route('/api/debug/bins/<item_code>', methods=['GET'])
def debug_item_stock(item_code):
    """Debug endpoint to check Bin/stock for specific item"""
    try:
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return jsonify({'error': 'Authentication failed'}), 401
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Test Bin query for this item
        stock_url = f"{BASE_URL}/api/resource/Bin"
        stock_params = {
            'fields': '["actual_qty", "warehouse", "item_code"]',
            'filters': f'[["item_code", "=", "{item_code}"]]'
        }
        
        response = session.get(stock_url, params=stock_params)
        
        if response.status_code == 200:
            stock_data = response.json()
            bins = stock_data.get('data', [])
            total_stock = sum(float(bin_data.get('actual_qty', 0)) for bin_data in bins)
            
            return jsonify({
                'success': True,
                'item_code': item_code,
                'total_stock': total_stock,
                'bins_count': len(bins),
                'bins': bins[:3]  # First 3 bins for debugging
            })
        else:
            return jsonify({
                'success': False,
                'status_code': response.status_code,
                'response_text': response.text[:300]
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Authentication Routes

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        email = data['email'].lower().strip()
        if '@' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        password = data['password']
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Register user
        result, status_code = auth_manager.register_user(
            email, 
            password, 
            data['first_name'].strip(), 
            data['last_name'].strip()
        )
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Login user
        result, status_code = auth_manager.login_user(email, password)
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/verify', methods=['GET'])
@require_auth
def verify_token():
    """Verify JWT token and return user info"""
    try:
        user_email = request.current_user['email']
        customer_id = request.current_user['customer_id']
        
        # Get customer details from ERPNext
        customer = auth_manager.get_erpnext_customer(user_email)
        
        if customer:
            return jsonify({
                'valid': True,
                'user': {
                    'email': user_email,
                    'customer_id': customer_id,
                    'customer_name': customer.get('customer_name', ''),
                }
            }), 200
        else:
            return jsonify({'error': 'Customer not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Token verification failed: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile from ERPNext"""
    try:
        user_email = request.current_user['email']
        
        # Get customer details from ERPNext
        customer = auth_manager.get_erpnext_customer(user_email)
        
        if customer:
            return jsonify({
                'user': {
                    'email': user_email,
                    'customer_id': customer['name'],
                    'customer_name': customer['customer_name'],
                    'email_id': customer.get('email_id', '')
                }
            }), 200
        else:
            return jsonify({'error': 'Customer profile not found'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

# Enhanced Products API with brand filtering

@app.route('/api/products/brands', methods=['GET'])
def get_brands():
    """Get all available brands"""
    try:
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return jsonify({'error': 'Authentication failed'}), 401
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Get distinct brands from item groups
        query_url = f"{BASE_URL}/api/resource/Item"
        params = {
            'fields': '["item_group"]',
            'filters': '[["item_group", "in", ["Nike", "Adidas", "Converse", "Jordan"]]]',
            'limit': 1000
        }
        
        response = session.get(query_url, params=params)
        
        if response.status_code == 200:
            items_data = response.json().get('data', [])
            brands = list(set([item['item_group'] for item in items_data if item.get('item_group')]))
            return jsonify({'brands': brands})
        else:
            return jsonify({'error': 'Failed to fetch brands'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/brand/<brand>', methods=['GET'])
def get_products_by_brand(brand):
    """Get products by specific brand"""
    try:
        cookies = cached_cookies or login_to_erpnext()
        if not cookies:
            return jsonify({'error': 'Authentication failed'}), 401
        
        session = requests.Session()
        session.cookies.update(cookies)
        
        # Query products by brand
        query_url = f"{BASE_URL}/api/resource/Item"
        params = {
            'fields': '["item_code", "item_name", "item_group", "standard_rate", "image", "description"]',
            'filters': f'[["item_group", "like", "%{brand}%"]]',
            'limit': 50
        }
        
        response = session.get(query_url, params=params)
        
        if response.status_code == 200:
            items_data = response.json().get('data', [])
            
            products = []
            for item in items_data:
                product = {
                    'item_code': item.get('item_code'),
                    'item_name': item.get('item_name', f'{brand} Product'),
                    'brand': brand,
                    'price': item.get('standard_rate', 200.00),
                    'stock_qty': 5,  # Placeholder for now
                    'image': item.get('image', ''),
                    'description': item.get('description', ''),
                    'item_group': item.get('item_group', '')
                }
                products.append(product)
            
            return jsonify({
                'products': products,
                'brand': brand,
                'count': len(products)
            })
        else:
            return jsonify({'error': f'Failed to fetch {brand} products'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Protected route example
@app.route('/api/user/orders', methods=['GET'])
@require_auth
def get_user_orders():
    """Get user's order history (protected route)"""
    try:
        customer_id = request.current_user['customer_id']
        
        # This would fetch actual orders from ERPNext
        # For now, return placeholder data
        return jsonify({
            'orders': [],
            'message': 'Order history feature coming soon',
            'customer_id': customer_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask ERPNext API server...")
    print(f"Connecting to: {BASE_URL}")
    app.run(debug=True, host='127.0.0.1', port=5000) 