// src/components/Navbar.jsx - Blockchain Integrated Version
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';
import MetaMaskConnect from './MetaMaskConnect';
import { useCart } from '../contexts/CartContext';
import UserProfileModal from './UserProfileModal';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [localQuery, setLocalQuery] = useState('');
  const { openCart, getTotalItems } = useCart();
  const [showProfile, setShowProfile] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const getOnSearch = () => (typeof window !== 'undefined' ? window.__APP_ON_SEARCH__ : null);

  // Sync search query with URL when on search page (only when location changes, not when localQuery changes)
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setLocalQuery(q);
    } else {
      // Clear search bar if not on search page
      setLocalQuery('');
    }
  }, [location.pathname, location.search]); // Remove localQuery from dependencies

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // Navigate to search page
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    } else {
      // If on search page, trigger search handler
      const onSearch = getOnSearch();
      if (onSearch) onSearch(localQuery);
    }
  };

  return (
    <>
    <nav className="glass sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo/Tên thương hiệu */}
          <Link to="/" className="flex-shrink-0 flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FaPills className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Propharm</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Blockchain
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex items-center space-x-4 ml-8 flex-1 max-w-2xl">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative flex-1">
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
                  // If on home page, trigger real-time search
                  if (location.pathname === '/') {
                    const fn = getOnSearch();
                    if (fn) fn(v);
                  }
                }}
                onKeyDown={(e) => {
                  // Navigate to search page on Enter key
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (localQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
                    }
                  }
                }}
                className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm placeholder-gray-500 hover:bg-white/80 transition-all duration-200"
              />
            </form>
          </div>

           {/* Icons/User */}
           <div className="ml-4 flex items-center md:ml-6 space-x-3">
             {/* Auth/Profile */}
             {!token ? (
               <Link
                 to="/login"
                 className="p-3 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group shadow-sm"
                 title="Đăng nhập"
               >
                 <FiUser className="h-5 w-5" strokeWidth={2} />
               </Link>
             ) : (
               <button
                 onClick={() => setShowProfile(true)}
                 className="p-3 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group shadow-sm"
                 title="Hồ sơ"
               >
                 <FiUser className="h-5 w-5" strokeWidth={2} />
               </button>
             )}

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

             {/* MetaMask Connect */}
             <MetaMaskConnect />
           </div>
        </div>
      </div>
    </nav>
    {showProfile && (
      <UserProfileModal onClose={() => setShowProfile(false)} />
    )}
    </>
  );
};

export default Navbar;

