import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBackendUrl } from '../utils/pricing';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Local storage keys (chỉ lưu token)
const STORAGE_KEY_TOKEN = 'pharma_access_token';
const STORAGE_KEY_OTP = 'pharma_otp_temp';

// Helper functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY_TOKEN) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setUser(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveToken = (t) => {
    setToken(t);
    if (t) {
      localStorage.setItem(STORAGE_KEY_TOKEN, t);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  };

  // Login với MongoDB backend
  const login = async (phone, password) => {
    setError('');
    setLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Lỗi kết nối server' }));
        throw new Error(errorData.detail || `Lỗi ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (!data.access_token) {
        throw new Error('Không nhận được token từ server');
      }
      
      saveToken(data.access_token);
      await fetchMe();
      return true;
    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      } else {
        setError(e.message || 'Đăng nhập thất bại');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register với MongoDB backend - sử dụng OTP từ backend
  const startRegister = async (phone) => {
    setError('');
    setLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Lỗi kết nối server' }));
        const errorMsg = errorData.detail || 'Lỗi khi gửi OTP';
        setError(errorMsg);
        return { action: 'ERROR', message: errorMsg };
      }
      
      const data = await res.json();
      
      // Nếu user đã tồn tại
      if (data.action === 'LOGIN') {
        return { action: 'LOGIN', message: 'Số điện thoại đã có tài khoản, vui lòng đăng nhập' };
      }
      
      // Lưu OTP từ backend vào localStorage để verify sau
      const otpData = {
        phone,
        otp: data.otp_displayed,
        expires_at: Date.now() + 5 * 60 * 1000 // 5 phút
      };
      localStorage.setItem(STORAGE_KEY_OTP, JSON.stringify(otpData));
      
      return {
        action: 'VERIFY_OTP',
        message: data.message || 'OTP đã được gửi',
        otp_displayed: data.otp_displayed // Hiển thị OTP từ backend
      };
    } catch (e) {
      const errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
      setError(errorMsg);
      return {
        action: 'ERROR',
        message: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP với backend
  const verifyOtp = async (phone, otp_code) => {
    setError('');
    setLoading(true);
    try {
      // Kiểm tra OTP local trước (để validate nhanh)
      const otpDataStr = localStorage.getItem(STORAGE_KEY_OTP);
      if (!otpDataStr) {
        setError('OTP không hợp lệ hoặc đã hết hạn');
        return { detail: 'OTP không hợp lệ hoặc đã hết hạn' };
      }

      const otpData = JSON.parse(otpDataStr);
      
      // Kiểm tra số điện thoại
      if (otpData.phone !== phone) {
        setError('Số điện thoại không khớp');
        return { detail: 'Số điện thoại không khớp' };
      }

      // Kiểm tra hết hạn
      if (Date.now() > otpData.expires_at) {
        localStorage.removeItem(STORAGE_KEY_OTP);
        setError('OTP đã hết hạn. Vui lòng yêu cầu mã mới');
        return { detail: 'OTP đã hết hạn. Vui lòng yêu cầu mã mới' };
      }

      // Verify OTP với backend
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/verify_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp_code })
    });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Lỗi xác thực OTP' }));
        const errorMsg = errorData.detail || 'Lỗi xác thực OTP';
        setError(errorMsg);
        return { detail: errorMsg };
      }
      
      const data = await res.json();
      
      if (!data.temp_token) {
        setError('Không nhận được token từ server');
        return { detail: 'Không nhận được token từ server' };
      }
      
      // Lưu temp token vào localStorage
      localStorage.setItem(STORAGE_KEY_OTP, JSON.stringify({
        ...otpData,
        verified: true,
        temp_token: data.temp_token
      }));

      return {
        temp_token: data.temp_token,
        message: 'Xác thực thành công'
      };
    } catch (e) {
      const errorMsg = e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')
        ? 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.'
        : 'Lỗi xác thực OTP';
      setError(errorMsg);
      return { detail: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Set password và tạo user trong MongoDB
  const setPassword = async (phone, password, temp_token) => {
    setError('');
    setLoading(true);
    try {
      const otpDataStr = localStorage.getItem(STORAGE_KEY_OTP);
      if (!otpDataStr) {
        setError('Phiên đăng ký đã hết hạn. Vui lòng bắt đầu lại');
        return { detail: 'Phiên đăng ký đã hết hạn. Vui lòng bắt đầu lại' };
      }

      const otpData = JSON.parse(otpDataStr);
      
      // Kiểm tra temp token
      if (otpData.temp_token !== temp_token || !otpData.verified) {
        setError('Token không hợp lệ');
        return { detail: 'Token không hợp lệ' };
      }

      // Lưu user vào MongoDB qua backend
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/set_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, temp_token })
    });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Lỗi khi đăng ký' }));
        const errorMsg = errorData.detail || 'Lỗi khi đăng ký';
        setError(errorMsg);
        return { detail: errorMsg };
      }
      
      const data = await res.json();
      
      // Xóa OTP data
      localStorage.removeItem(STORAGE_KEY_OTP);
      
      return {
        message: data.message || 'Đăng ký thành công'
      };
    } catch (e) {
      const errorMsg = e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')
        ? 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.'
        : 'Lỗi khi đăng ký';
      setError(errorMsg);
      return { detail: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      const data = await res.json();
      setUser(data);
    } catch (e) {
      setUser(null);
      // Nếu token không hợp lệ, xóa token
      if (e.message.includes('401') || e.message.includes('Invalid')) {
        saveToken('');
      }
    }
  };

  const logout = () => {
    saveToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      error, 
      loading, 
      login, 
      logout, 
      startRegister, 
      verifyOtp, 
      setPassword, 
      fetchMe 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
