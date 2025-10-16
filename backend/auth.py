import sqlite3
import hashlib
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
import os
import re

class AuthManager:
    def __init__(self, base_url=None, username=None, password=None):
        """Initialize local SQLite authentication system"""
        self.db_path = 'data/nike_users.db'
        self.secret_key = "nike-auth-secret-2025-production"  # Change this in production
        self.init_database()
        print("✅ Auth database initialized")
        
    def init_database(self):
        """Initialize SQLite database for users and favorites"""
        os.makedirs('data', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        ''')
        
        # Create favorites table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id TEXT NOT NULL,
                product_name TEXT,
                product_price REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, product_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def hash_password(self, password):
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password, hashed):
        """Verify password against hash"""
        return self.hash_password(password) == hashed
    
    def validate_email(self, email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def generate_token(self, user_id, email):
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def register_user(self, email, password, first_name=None, last_name=None):
        """Register new user"""
        try:
            # Validate email
            if not self.validate_email(email):
                return {'success': False, 'message': 'Invalid email format'}
            
            # Validate password
            if len(password) < 6:
                return {'success': False, 'message': 'Password must be at least 6 characters'}
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                conn.close()
                return {'success': False, 'message': 'Email already registered'}
            
            # Hash password and create user
            password_hash = self.hash_password(password)
            cursor.execute('''
                INSERT INTO users (email, password_hash, first_name, last_name)
                VALUES (?, ?, ?, ?)
            ''', (email, password_hash, first_name, last_name))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            # Generate token
            token = self.generate_token(user_id, email)
            
            return {
                'success': True,
                'message': 'User registered successfully',
                'token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name
                }
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Registration failed: {str(e)}'}
    
    def login_user(self, email, password):
        """Login user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get user by email
            cursor.execute('''
                SELECT id, email, password_hash, first_name, last_name, is_active
                FROM users WHERE email = ?
            ''', (email,))
            
            user = cursor.fetchone()
            conn.close()
            
            if not user:
                return {'success': False, 'message': 'Invalid email or password'}
            
            user_id, user_email, password_hash, first_name, last_name, is_active = user
            
            if not is_active:
                return {'success': False, 'message': 'Account is deactivated'}
            
            # Verify password
            if not self.verify_password(password, password_hash):
                return {'success': False, 'message': 'Invalid email or password'}
            
            # Generate token
            token = self.generate_token(user_id, user_email)
            
            return {
                'success': True,
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user_id,
                    'email': user_email,
                    'first_name': first_name,
                    'last_name': last_name
                }
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Login failed: {str(e)}'}
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, email, first_name, last_name, created_at
                FROM users WHERE id = ? AND is_active = TRUE
            ''', (user_id,))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return {
                    'id': user[0],
                    'email': user[1],
                    'first_name': user[2],
                    'last_name': user[3],
                    'created_at': user[4]
                }
            return None
            
        except Exception as e:
            print(f"Error getting user: {str(e)}")
            return None
    
    def add_favorite(self, user_id, product_id, product_name=None, product_price=None):
        """Add product to user favorites"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR IGNORE INTO favorites (user_id, product_id, product_name, product_price)
                VALUES (?, ?, ?, ?)
            ''', (user_id, product_id, product_name, product_price))
            
            conn.commit()
            affected_rows = cursor.rowcount
            conn.close()
            
            return {'success': True, 'added': affected_rows > 0}
            
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def remove_favorite(self, user_id, product_id):
        """Remove product from user favorites"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                DELETE FROM favorites WHERE user_id = ? AND product_id = ?
            ''', (user_id, product_id))
            
            conn.commit()
            affected_rows = cursor.rowcount
            conn.close()
            
            return {'success': True, 'removed': affected_rows > 0}
            
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_user_favorites(self, user_id):
        """Get all user favorites"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT product_id, product_name, product_price, created_at
                FROM favorites WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
            
            favorites = cursor.fetchall()
            conn.close()
            
            return [
                {
                    'product_id': fav[0],
                    'product_name': fav[1],
                    'product_price': fav[2],
                    'created_at': fav[3]
                }
                for fav in favorites
            ]
            
        except Exception as e:
            print(f"Error getting favorites: {str(e)}")
            return []

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        # Verify token
        from flask import current_app
        auth_manager = current_app.auth_manager
        payload = auth_manager.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request
        request.current_user = {
            'user_id': payload['user_id'],
            'email': payload['email']
        }
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Get current authenticated user"""
    if hasattr(request, 'current_user'):
        return request.current_user
    return None 