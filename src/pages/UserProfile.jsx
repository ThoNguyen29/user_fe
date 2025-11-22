import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getBackendUrl } from '../utils/pricing';
import { FiWallet, FiPhone, FiCreditCard, FiTrendingUp, FiCalendar, FiLogOut, FiUser } from '../components/Icons';

function UserProfile() {
  const { user, token, logout } = useAuth();
  const { account } = useWeb3();
  const [txs, setTxs] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const res = await fetch(`${getBackendUrl()}/api/revenue?month=${month}&year=${year}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched data:", data); // Add debug log for data
          setTxs(data.transactions || []);
          setTotal(data.total || 0);
        } else {
          console.log('Failed to fetch data from backend');
          setTxs([]);
          setTotal(0);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
        setTxs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadHistory();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FiUser className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 leading-relaxed">
            Bạn cần đăng nhập để xem thông tin người dùng và lịch sử giao dịch của mình.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          

          

          {/* Average Transaction Card */}
          
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <FiWallet className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Tài khoản của bạn</h2>
            
                {user?.phone && (
                  <div className="mt-3 inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                    <FiPhone className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiWallet className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Địa chỉ ví</span>
                  </div>
                  <div className="font-mono text-xs break-all bg-white p-3 rounded-xl text-gray-700 border border-gray-200 leading-relaxed">
                    {account || 'Chưa kết nối ví MetaMask'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiPhone className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Số điện thoại đăng ký</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {user?.phone || user?.username || 'Chưa có thông tin'}
                  </p>
                  {user && !user.phone && !user.username && (
                    <p className="text-xs text-gray-500 mt-2">Vui lòng cập nhật thông tin</p>
                  )}
                </div>
              </div>

              <button 
                className="mt-6 w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group" 
                onClick={logout}
              >
                <FiLogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h3>
                  <p className="text-sm text-gray-500 mt-1">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiCreditCard className="w-6 h-6 text-white" />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {txs.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCreditCard className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">Chưa có giao dịch nào</p>
                      <p className="text-sm text-gray-400 mt-2">Lịch sử giao dịch của bạn sẽ xuất hiện ở đây</p>
                    </div>
                  ) : (
                    txs.map((tx, i) => (
                      <div 
                        key={i} 
                        className="group bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                              <FiCreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <FiCalendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500">{tx.date}</span>
                              </div>
                              <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                                {tx.customer}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2">
                            <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                              {tx.price_eth} ETH
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              ≈ ${(Number(tx.price_eth) * 2000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
