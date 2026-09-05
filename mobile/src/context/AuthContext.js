import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('pirate_token');
      const storedUser = await AsyncStorage.getItem('pirate_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load stored auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: jwtToken, ...userData } = res.data;
    await AsyncStorage.setItem('pirate_token', jwtToken);
    await AsyncStorage.setItem('pirate_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (registerData) => {
    const res = await authApi.register(registerData);
    const { token: jwtToken, ...userData } = res.data;
    await AsyncStorage.setItem('pirate_token', jwtToken);
    await AsyncStorage.setItem('pirate_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('pirate_token');
      await AsyncStorage.removeItem('pirate_user');
    } catch (e) {
      console.error('Failed to clear stored auth:', e);
    }
    setToken(null);
    setUser(null);
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authApi.changePassword({ oldPassword, newPassword });
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        changePassword,
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
