"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  getToken: () => string | null;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          // Verify token by fetching profile
          const response = await fetch('http://localhost:5000/api/admin/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAdmin(data.admin);
            setIsAuthenticated(true);
          } else {
            // Token is invalid
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
          }
        } catch {
          // Error verifying token
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      setAdmin(data.admin);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const setToken = (token: string) => {
    localStorage.setItem('adminToken', token);
  };

  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  const isTokenValid = () => {
    const token = localStorage.getItem('adminToken');
    return !!token;
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setToken,
    getToken,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
