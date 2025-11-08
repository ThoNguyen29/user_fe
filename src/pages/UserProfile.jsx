import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useTransactions } from '../contexts/TransactionContext';
import { FiExternalLink, FiUser, FiLogOut, FiCopy, FiCheck, FiArrowLeft, FiPhone } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

function UserProfile({ onBack }) {
  const { user, token, logout } = useAuth();
  const { account } = useWeb3();
  const { getTransactionsByAccount, getTotalByAccount } = useTransactions();
  
  // Handle back button
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback: scroll to top hoặc reload page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Hoặc có thể dùng window.location.href = '/' nếu cần
    }
  };
  
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Lấy transactions của user hiện tại
  const userAccount = account || user?.wallet_address;
  const transactions = userAccount ? getTransactionsByAccount(userAccount) : [];
  const total = userAccount ? getTotalByAccount(userAccount) : 0;

  // Copy address to clipboard
  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
      }
  };

  // Get explorer URL
  const getExplorerUrl = (txHash, chainId) => {
    if (chainId === '0xaa36a7' || chainId === '11155111') {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
    return `https://etherscan.io/tx/${txHash}`;
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <FaPills className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-600">Bạn cần đăng nhập để xem thông tin người dùng và lịch sử giao dịch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                title="Quay lại trang chủ"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaPills className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Thông tin tài khoản</h1>
                  <p className="text-sm text-gray-500">Quản lý thông tin cá nhân và lịch sử giao dịch</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Thông tin tài khoản */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card - Redesigned */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100">
              {/* Profile Header */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiUser className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Thông tin tài khoản</h2>
              </div>

              <div className="space-y-5">
                {/* Phone Number */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Số điện thoại
                  </label>
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span className="text-base font-semibold text-gray-800">
                      {user?.phone || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Wallet Address - MetaMask hoặc từ user */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Địa chỉ ví
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 break-all text-gray-800">
                      {account || user?.wallet_address || 'Chưa kết nối MetaMask'}
                    </code>
                    {(account || user?.wallet_address) && (
                      <button
                        onClick={() => copyAddress(account || user?.wallet_address)}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="Sao chép"
                      >
                        {copiedAddress ? (
                          <FiCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <FiCopy className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                  {account && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Đã kết nối MetaMask
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Lịch sử giao dịch */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Lịch sử giao dịch</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Tổng đã giao dịch</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Number(total).toFixed(6)} ETH
          </div>
        </div>
      </div>

              {!userAccount ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">Vui lòng kết nối MetaMask</p>
                  <p className="text-sm text-gray-500">để xem lịch sử giao dịch</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPills className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDate(tx.date)}
                            </span>
                            {tx.status && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                tx.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {tx.status === 'completed' ? 'Hoàn thành' : tx.status}
                              </span>
                            )}
                          </div>

                          <div className="mb-3">
                            <div className="font-semibold text-gray-900 mb-1">
                              {tx.medicine?.map((med, idx) => (
                                <span key={idx} className="mr-2">
                                  {med.name} <span className="text-gray-500">x{med.qty}</span>
                                  {idx < tx.medicine.length - 1 && ','}
                                </span>
                              )) || 'Giao dịch'}
                            </div>
                          </div>

                          {tx.tx_hash && (
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono border">
                                {tx.tx_hash.slice(0, 12)}...{tx.tx_hash.slice(-10)}
                              </code>
                              <a
                                href={getExplorerUrl(tx.tx_hash, tx.chain_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                title="Xem trên Etherscan"
                              >
                                <FiExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="text-right lg:min-w-[150px]">
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {Number(tx.price_eth || 0).toFixed(6)} ETH
                          </div>
                          {tx.price_usd && (
                            <div className="text-sm text-gray-500">
                              ${Number(tx.price_usd).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
