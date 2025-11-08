// src/components/Navbar.jsx - Blockchain Integrated Version
import React, { useState } from 'react';
import { FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';
import MetaMaskConnect from './MetaMaskConnect';
import { useCart } from '../contexts/CartContext';
import UserProfileModal from './UserProfileModal';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [localQuery, setLocalQuery] = useState('');
  const { openCart, getTotalItems } = useCart();
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { token, user, fetchMe } = useAuth();
  const getOnSearch = () => (typeof window !== 'undefined' ? window.__APP_ON_SEARCH__ : null);

  const handleSearch = (e) => {
    e.preventDefault();
    const fn = getOnSearch();
    if (fn) fn(localQuery);
  };

  return (
    <>
      <nav className="glass sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo/Tên thương hiệu */}
            <div className="shrink-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaPills className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Propharm</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm thuốc, sản phẩm y tế..."
                  value={localQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalQuery(v);
                    const fn = getOnSearch();
                    if (fn) fn(v);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm placeholder-gray-500 hover:bg-white/80 transition-all duration-200"
                />
              </form>
            </div>

            {/* Right Section: User/Cart/MetaMask */}
            <div className="flex items-center space-x-4">
              

              {/* Cart Icon */}
              <button 
                onClick={openCart}
                className="relative p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <FiShoppingCart className="h-6 w-6" strokeWidth={2} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* User Icon */}
              <button
                onClick={async () => {
                  // Re-validate current user with backend; if not authenticated show auth modal
                  if (!token) {
                    setShowAuth(true);
                    return;
                  }
                  try {
                    await fetchMe();
                    if (user) setShowProfile(true);
                    else setShowAuth(true);
                  } catch (e) {
                    setShowAuth(true);
                  }
                }}
                className="p-3 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group shadow-sm"
              >
                <FiUser className="h-5 w-5" strokeWidth={2} />
              </button>

              {/* MetaMask Connect */}
              <MetaMaskConnect />
            </div>
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar;

