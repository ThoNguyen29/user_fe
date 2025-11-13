import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginRegister = () => {
  const { login, startRegister, verifyOtp, setPassword, error, loading } = useAuth();
  const [tab, setTab] = useState('login');

  // Login state
  const [phoneLogin, setPhoneLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Register state
  const [phoneReg, setPhoneReg] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [serverMsg, setServerMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerMsg('');
    const ok = await login(phoneLogin, passwordLogin);
    if (ok) setServerMsg('Đăng nhập thành công.');
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setServerMsg('');
    const res = await startRegister(phoneReg);
    if (res?.otp_displayed) {
      setServerMsg(`OTP: ${res.otp_displayed}`);
    } else if (res?.action === 'LOGIN') {
      setServerMsg('Số điện thoại đã có tài khoản, vui lòng đăng nhập.');
    } else {
      setServerMsg(res?.message || 'Đã yêu cầu OTP.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setServerMsg('');
    const res = await verifyOtp(phoneReg, otp);
    if (res?.temp_token) {
      setTempToken(res.temp_token);
      setServerMsg('OTP hợp lệ. Vui lòng đặt mật khẩu.');
    } else {
      setServerMsg(res?.detail || 'Xác thực OTP thất bại');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setServerMsg('');
    const res = await setPassword(phoneReg, passwordReg, tempToken);
    setServerMsg(res?.message || res?.detail || 'Hoàn tất');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex space-x-4 mb-6">
        <button className={`px-4 py-2 rounded ${tab==='login'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('login')}>Đăng nhập</button>
        <button className={`px-4 py-2 rounded ${tab==='register'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('register')}>Đăng ký</button>
      </div>

      {tab==='login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" placeholder="Số điện thoại" value={phoneLogin} onChange={e=>setPhoneLogin(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Mật khẩu" value={passwordLogin} onChange={e=>setPasswordLogin(e.target.value)} />
          <button className="w-full bg-blue-600 text-white rounded px-4 py-2" disabled={loading}>Đăng nhập</button>
        </form>
      )}

      {tab==='register' && (
        <div className="space-y-6">
          <form onSubmit={handleStart} className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Số điện thoại" value={phoneReg} onChange={e=>setPhoneReg(e.target.value)} />
            <button className="w-full bg-blue-600 text-white rounded px-4 py-2">Gửi OTP</button>
          </form>

          <form onSubmit={handleVerify} className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} />
            <button className="w-full bg-indigo-600 text-white rounded px-4 py-2">Xác thực OTP</button>
          </form>

          <form onSubmit={handleSetPassword} className="space-y-3">
            <input className="w-full border rounded px-3 py-2" type="password" placeholder="Mật khẩu mới" value={passwordReg} onChange={e=>setPasswordReg(e.target.value)} />
            <button className="w-full bg-green-600 text-white rounded px-4 py-2">Đặt mật khẩu</button>
          </form>
        </div>
      )}

      {(error || serverMsg) && (
        <div className="mt-4 text-sm">
          {error && <div className="text-red-600">{error}</div>}
          {serverMsg && <div className="text-gray-700">{serverMsg}</div>}
        </div>
      )}
    </div>
  );
};

export default LoginRegister;


