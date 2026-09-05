import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pirate_user');
    const token = localStorage.getItem('pirate_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('pirate_token', token);
    localStorage.setItem('pirate_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role, targetGoal, bodyWeightKg) => {
    const res = await authApi.register({
      name,
      email,
      password,
      role: role || 'ROLE_CLIENT',
      targetGoal,
      bodyWeightKg: bodyWeightKg ? parseFloat(bodyWeightKg) : null,
    });
    const { token, ...userData } = res.data;
    localStorage.setItem('pirate_token', token);
    localStorage.setItem('pirate_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pirate_token');
    localStorage.removeItem('pirate_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading }}>
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
