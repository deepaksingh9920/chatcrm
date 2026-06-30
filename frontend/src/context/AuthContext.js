import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const data = await api.me();
        setUser(data.user);
        setCompany(data.company);
      }
    } catch (err) {
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
    setCompany(data.company);
    return data;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
    setCompany(data.company);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
