import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const LoginRegister = ({ onSuccess }) => {
  const { login, startRegister, verifyOtp, setPassword, error, loading } = useAuth();
  
  // Helper để gọi login từ component
  const handleAutoLogin = async (phone, password) => {
    return await login(phone, password);
  };
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [phoneLogin, setPhoneLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Register state
  const [phoneReg, setPhoneReg] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerStep, setRegisterStep] = useState(1); // 1: phone, 2: otp, 3: password
  const [serverMsg, setServerMsg] = useState('');
  const [otpDisplay, setOtpDisplay] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerMsg('');
    const ok = await login(phoneLogin, passwordLogin);
    if (ok) {
      setServerMsg('Đăng nhập thành công!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        window.location.reload(); // Reload để cập nhật trạng thái
      }, 1000);
    } else {
      setServerMsg(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleStartRegister = async (e) => {
    e.preventDefault();
    setServerMsg('');
    if (!phoneReg || phoneReg.length < 10) {
      setServerMsg('Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)');
      return;
    }
    
    const res = await startRegister(phoneReg);
    if (res?.otp_displayed) {
      setOtpDisplay(res.otp_displayed);
      setServerMsg(`Mã OTP đã được gửi: ${res.otp_displayed}`);
      setRegisterStep(2);
    } else if (res?.action === 'LOGIN') {
      setServerMsg('Số điện thoại đã có tài khoản, vui lòng đăng nhập.');
      setTab('login');
      setPhoneLogin(phoneReg);
    } else {
      setServerMsg(res?.message || 'Đã yêu cầu OTP.');
      setRegisterStep(2);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setServerMsg('');
    if (!otp || otp.length !== 6) {
      setServerMsg('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    
    const res = await verifyOtp(phoneReg, otp);
    if (res?.temp_token) {
      setTempToken(res.temp_token);
      setServerMsg('Xác thực OTP thành công! Vui lòng đặt mật khẩu.');
      setRegisterStep(3);
    } else {
      setServerMsg(res?.detail || 'Xác thực OTP thất bại');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setServerMsg('');
    if (!passwordReg || passwordReg.length < 6) {
      setServerMsg('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordReg !== confirmPassword) {
      setServerMsg('Mật khẩu xác nhận không khớp');
      return;
    }
    
    const res = await setPassword(phoneReg, passwordReg, tempToken);
    if (res?.message) {
      setServerMsg('Đăng ký thành công! Đang tự động đăng nhập...');
      // Tự động đăng nhập sau khi đăng ký
      setTimeout(async () => {
        const loginOk = await handleAutoLogin(phoneReg, passwordReg);
        if (loginOk) {
          setServerMsg('Đăng ký và đăng nhập thành công!');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            window.location.reload();
          }, 1000);
        } else {
          // Nếu đăng nhập tự động thất bại, chuyển sang tab login
          setTab('login');
          setPhoneLogin(phoneReg);
          setServerMsg('Đăng ký thành công! Vui lòng đăng nhập.');
        }
        setRegisterStep(1);
        setOtp('');
        setPasswordReg('');
        setConfirmPassword('');
        setTempToken('');
      }, 1500);
    } else {
      setServerMsg(res?.detail || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
          <FaPills className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng đến Propharm</h2>
        <p className="text-gray-500">Đăng nhập hoặc tạo tài khoản mới</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => {
            setTab('login');
            setServerMsg('');
            setRegisterStep(1);
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            tab === 'login'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Đăng Nhập
        </button>
        <button
          onClick={() => {
            setTab('register');
            setServerMsg('');
            setRegisterStep(1);
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            tab === 'register'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Đăng Ký
        </button>
      </div>

      {/* Messages */}
      {(error || serverMsg) && (
        <div className={`mb-4 p-4 rounded-xl ${
          serverMsg.includes('thành công') || serverMsg.includes('OTP đã được gửi') || serverMsg.includes('OTP đã được gửi')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <p className="text-sm font-medium">{error || serverMsg}</p>
        </div>
      )}

      {/* Login Form */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneLogin}
                onChange={(e) => setPhoneLogin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Số điện thoại"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                maxLength={11}
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordLogin}
                onChange={(e) => setPasswordLogin(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {tab === 'register' && (
        <div className="space-y-5">
          {/* Step 1: Phone */}
          {registerStep === 1 && (
            <form onSubmit={handleStartRegister} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneReg}
                  onChange={(e) => setPhoneReg(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Số điện thoại (10-11 chữ số)"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  maxLength={11}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Gửi Mã OTP
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {registerStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {otpDisplay && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <p className="text-sm text-yellow-800 font-semibold">
                    Mã OTP: <span className="text-lg">{otpDisplay}</span>
                  </p>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="Nhập mã OTP 6 chữ số"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-semibold"
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
                  setRegisterStep(1);
                  setOtp('');
                  setServerMsg('');
                }}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Quay lại
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {registerStep === 3 && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={passwordReg}
                  onChange={(e) => setPasswordReg(e.target.value)}
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Hoàn Tất Đăng Ký
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisterStep(2);
                  setPasswordReg('');
                  setConfirmPassword('');
                  setServerMsg('');
                }}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Quay lại
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
