import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('rvn_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('rvn_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify and sync authenticated user with backend on startup
  const checkAuth = useCallback(async (authToken) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('rvn_user', JSON.stringify(data.user));
      } else {
        // Invalid or expired token
        logout();
      }
    } catch (err) {
      console.warn('Backend connection issue while checking auth session:', err.message);
      // Keep cached localStorage user for offline resiliency if available
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const authenticatedUser = data.user;
      const userToken = data.token;

      setUser(authenticatedUser);
      setToken(userToken);
      localStorage.setItem('rvn_token', userToken);
      localStorage.setItem('rvn_user', JSON.stringify(authenticatedUser));
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, phone, password, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, password, role }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      const newUser = data.user;
      const userToken = data.token;

      setUser(newUser);
      setToken(userToken);
      localStorage.setItem('rvn_token', userToken);
      localStorage.setItem('rvn_user', JSON.stringify(newUser));
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rvn_token');
    localStorage.removeItem('rvn_user');
    localStorage.removeItem('rvn_cart');
  };

  const isAuthenticated = Boolean(user && token);
  const isCustomer = user?.role === 'customer';
  const isEntrepreneur = user?.role === 'entrepreneur';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isCustomer,
        isEntrepreneur,
        role: user?.role || null,
        refreshUser: () => checkAuth(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
