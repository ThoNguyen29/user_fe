import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBackendUrl } from '../utils/pricing';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) fetchMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveToken = (t) => {
    setToken(t);
    if (t) localStorage.setItem('access_token', t); else localStorage.removeItem('access_token');
  };

  const login = async (phone, password) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      saveToken(data.access_token);
      await fetchMe();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startRegister = async (phone) => {
    const res = await fetch(`${getBackendUrl()}/api/auth/start`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await res.json();
  };

  const verifyOtp = async (phone, otp_code) => {
    const res = await fetch(`${getBackendUrl()}/api/auth/verify_otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp_code })
    });
    return await res.json();
  };

  const setPassword = async (phone, password, temp_token) => {
    const res = await fetch(`${getBackendUrl()}/api/auth/set_password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, temp_token })
    });
    return await res.json();
  };

  const fetchMe = async () => {
    if (!token) { setUser(null); return; }
    try {
      const res = await fetch(`${getBackendUrl()}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        // Token expired or invalid
        saveToken('');
        setUser(null);
        return;
      }
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.log('Error fetching user:', e);
      setUser(null);
    }
  };

  const logout = () => {
    saveToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, error, loading, login, logout, startRegister, verifyOtp, setPassword }}>
      {children}
    </AuthContext.Provider>
  );
};


