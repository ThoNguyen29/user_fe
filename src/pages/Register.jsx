import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowLeft, FiMail, FiShield } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const Register = () => {
  const { startRegister, verifyOtp, setPassword: setPasswordFromAuth, error } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step management
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Password
  const [tempToken, setTempToken] = useState('');
  const [localError, setLocalError] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    
    if (!phone) {
      setLocalError('Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    try {
      const res = await startRegister(phone);
      if (res?.otp_displayed) {
        setLocalMessage(`Mã OTP: ${res.otp_displayed}`);
        setStep(2);
      } else if (res?.action === 'LOGIN') {
        setLocalError('Số điện thoại đã có tài khoản. Vui lòng đăng nhập.');
      } else {
        setLocalMessage(res?.message || 'Đã gửi mã OTP. Vui lòng kiểm tra tin nhắn.');
        setStep(2);
      }
    } catch (err) {
      setLocalError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    
    if (!otp) {
      setLocalError('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      if (res?.temp_token) {
        setTempToken(res.temp_token);
        setStep(3);
        setLocalMessage('Xác thực OTP thành công. Vui lòng đặt mật khẩu.');
      } else {
        setLocalError(res?.detail || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
      }
    } catch (err) {
      setLocalError(err.message || 'Xác thực OTP thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    
    if (!password || !confirmPassword) {
      setLocalError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await setPasswordFromAuth(phone, password, tempToken);
      if (res?.message || res?.access_token) {
        setLocalMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setLocalError(res?.detail || 'Đặt mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setLocalError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setLocalError('');
      setLocalMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo và Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Về trang chủ</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaPills className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Propharm
            </span>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
            <p className="text-gray-500">Đăng ký để bắt đầu sử dụng dịch vụ</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 2 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 3 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Error/Success Message */}
          {localError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{localError}</p>
            </div>
          )}
          {localMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm text-center">{localMessage}</p>
            </div>
          )}

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </span>
                ) : (
                  'Gửi mã OTP'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiShield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 text-center text-2xl tracking-widest"
                    required
                    maxLength={6}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Mã OTP đã được gửi đến số điện thoại của bạn
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xác thực...
                    </span>
                  ) : (
                    'Xác thực OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Set Password */}
          {step === 3 && (
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo tài khoản...
                    </span>
                  ) : (
                    'Hoàn tất đăng ký'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <a href="#" className="text-purple-600 hover:underline">Điều khoản sử dụng</a>
          {' '}và{' '}
          <a href="#" className="text-purple-600 hover:underline">Chính sách bảo mật</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

