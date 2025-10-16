const API_BASE_URL = 'http://127.0.0.1:5000/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('nike_token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Authentication methods
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAuthData(data.token, data.user);
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAuthData(data.token, data.user);
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async verifyToken() {
    if (!this.token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        this.user = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, data };
      } else {
        this.logout();
        return { success: false, error: data.error || 'Token invalid' };
      }
    } catch (error) {
      this.logout();
      return { success: false, error: 'Network error' };
    }
  }

  async getProfile() {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to get profile' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('nike_token');
    localStorage.removeItem('user');
  }

  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('nike_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  // API methods with authentication
  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Multi-brand API methods
  async getBrands() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/brands`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, brands: data.brands };
      } else {
        return { success: false, error: data.error || 'Failed to fetch brands' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getProductsByBrand(brand) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/brand/${brand}`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || `Failed to fetch ${brand} products` };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getUserOrders() {
    try {
      const response = await this.makeAuthenticatedRequest('/user/orders');
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to fetch orders' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 