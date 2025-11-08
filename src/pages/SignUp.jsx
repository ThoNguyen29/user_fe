import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

export default function SignUp() {
  const { startRegister, verifyOtp, setPassword, loading, error } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState(null);
  const [serverMsg, setServerMsg] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDisplay, setOtpDisplay] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerMsg('');
    if (!username || !phone || !password || !confirm) {
      setServerMsg('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (username.length < 3) {
      setServerMsg('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }
    if (phone.length < 10 || phone.length > 11) {
      setServerMsg('Số điện thoại phải có 10-11 chữ số');
      return;
    }
    if (password.length < 6) {
      setServerMsg('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirm) {
      setServerMsg('Mật khẩu xác nhận không khớp');
      return;
    }

    const res = await startRegister(phone);
    if (res?.otp_displayed) {
      setOtpDisplay(res.otp_displayed);
      setServerMsg(`Mã OTP đã được gửi: ${res.otp_displayed}`);
      setShowOtp(true);
    } else if (res?.temp_token) {
      setTempToken(res.temp_token);
      setShowOtp(true);
    } else if (res?.action === 'LOGIN') {
      setServerMsg('Số điện thoại đã có tài khoản, vui lòng đăng nhập.');
    } else {
      setServerMsg(res?.message || 'Đã yêu cầu OTP.');
      setShowOtp(true);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setServerMsg('');
    if (!otp || otp.length !== 6) {
      setServerMsg('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    const res = await verifyOtp(phone, otp);
    if (res?.temp_token) {
      setTempToken(res.temp_token);
      setServerMsg('Xác thực OTP thành công! Vui lòng đặt mật khẩu.');
    } else {
      setServerMsg(res?.detail || 'Xác thực OTP thất bại');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setServerMsg('');
    if (!tempToken) {
      setServerMsg('Không có token xác thực. Vui lòng thử lại.');
      return;
    }
    if (password !== confirm) {
      setServerMsg('Mật khẩu xác nhận không khớp');
      return;
    }
    const res = await setPassword(phone, password, tempToken);
    if (res?.message) {
      setServerMsg('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setServerMsg(res?.detail || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <FaPills className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Ký Tài Khoản</h1>
            <p className="text-gray-500 text-sm">Tạo tài khoản mới để bắt đầu</p>
          </div>

          {/* Messages */}
          {(error || serverMsg) && (
            <div className={`mb-6 p-4 rounded-xl ${
              serverMsg.includes('thành công') || serverMsg.includes('OTP đã được gửi')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p className="text-sm font-medium">{error || serverMsg}</p>
            </div>
          )}

          {/* Main Registration Form */}
          {!showOtp && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Số điện thoại (10-11 chữ số)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={11}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Xác nhận mật khẩu"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {showOtp && !tempToken && (
            <form onSubmit={handleVerify} className="space-y-4">
              {otpDisplay && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <p className="text-sm text-yellow-800 font-semibold">
                    Mã OTP: <span className="text-lg">{otpDisplay}</span>
                  </p>
                </div>
              )}
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-semibold"
                  placeholder="Nhập mã OTP 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Xác Thực OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp('');
                  setServerMsg('');
                }}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Quay lại
              </button>
            </form>
          )}

          {/* Set Password */}
          {showOtp && tempToken && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Đặt mật khẩu"
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Xác nhận mật khẩu"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Hoàn Tất
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
